import type { StructuredCv } from "./anthropic";
import { generateApplicationDocuments } from "./documents";
import { sendNewMatchesEmail } from "./email";
import { searchJobs } from "./jobtech";
import { scoreJobMatches } from "./matching";
import { coverLetterHtmlTemplate, cvHtmlTemplate } from "./pdf-templates";
import { renderHtmlToPdf } from "./pdf";
import { prisma } from "./prisma";
import { uploadFile } from "./storage";

const MAX_NEW_MATCHES_PER_RUN = 5;
const MIN_MATCH_SCORE = 0.5;

type Preferences = {
  roles: string[];
  locations: string[];
};

export async function runMatchingPipelineForUser(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: { user: true },
  });
  if (!profile || !profile.structuredCv) {
    return;
  }

  const preferences = profile.preferences as Preferences;
  const ads = await searchJobs(preferences.roles, preferences.locations);
  if (ads.length === 0) {
    return;
  }

  const existing = await prisma.jobMatch.findMany({
    where: {
      userId,
      externalJobId: { in: ads.map((ad) => ad.externalJobId) },
    },
    select: { externalJobId: true },
  });
  const seen = new Set(existing.map((e) => e.externalJobId));
  const newAds = ads.filter((ad) => !seen.has(ad.externalJobId));
  if (newAds.length === 0) {
    return;
  }

  const cv = profile.structuredCv as StructuredCv;
  const scores = await scoreJobMatches(cv, newAds);

  const topAds = newAds
    .map((ad) => ({ ad, score: scores.get(ad.externalJobId) ?? 0 }))
    .filter((entry) => entry.score >= MIN_MATCH_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_NEW_MATCHES_PER_RUN);

  const createdMatches: { jobTitle: string; employer: string }[] = [];

  for (const { ad, score } of topAds) {
    try {
      const docs = await generateApplicationDocuments(cv, ad);
      const cvPdf = await renderHtmlToPdf(
        cvHtmlTemplate(cv.fullName, docs.cvContentHtml),
      );
      const coverLetterPdf = await renderHtmlToPdf(
        coverLetterHtmlTemplate(docs.coverLetterHtml),
      );

      const cvUrl = await uploadFile(
        `documents/${userId}/${ad.externalJobId}-cv.pdf`,
        cvPdf,
        "application/pdf",
      );
      const coverLetterUrl = await uploadFile(
        `documents/${userId}/${ad.externalJobId}-brev.pdf`,
        coverLetterPdf,
        "application/pdf",
      );

      await prisma.jobMatch.create({
        data: {
          userId,
          externalJobId: ad.externalJobId,
          jobTitle: ad.jobTitle,
          employer: ad.employer,
          url: ad.url,
          rawAdText: ad.rawAdText,
          matchScore: score,
          deadline: ad.deadline,
          documents: {
            create: [
              { type: "CV", pdfUrl: cvUrl },
              { type: "COVER_LETTER", pdfUrl: coverLetterUrl },
            ],
          },
        },
      });

      createdMatches.push({ jobTitle: ad.jobTitle, employer: ad.employer });
    } catch (err) {
      console.error(
        `Kunde inte generera ansökan för annons ${ad.externalJobId} (user ${userId})`,
        err,
      );
    }
  }

  if (createdMatches.length > 0) {
    await sendNewMatchesEmail(profile.user.email, createdMatches);
  }
}

export async function runMatchingPipelineForAllUsers() {
  const profiles = await prisma.profile.findMany({
    select: { userId: true, structuredCv: true },
  });

  for (const profile of profiles) {
    if (!profile.structuredCv) continue;
    try {
      await runMatchingPipelineForUser(profile.userId);
    } catch (err) {
      console.error(
        `Matchningspipeline misslyckades för användare ${profile.userId}`,
        err,
      );
    }
  }
}
