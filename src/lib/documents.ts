import { z } from "zod";
import { assertGeminiOk, gemini, MODEL, type StructuredCv } from "./gemini";
import type { JobAd } from "./jobtech";
import { sanitizeGeneratedHtml } from "./sanitize";

const GeneratedDocsSchema = z.object({
  cvContentHtml: z.string(),
  coverLetterHtml: z.string(),
});

export type GeneratedDocs = {
  cvContentHtml: string;
  coverLetterHtml: string;
};

export async function generateApplicationDocuments(
  cv: StructuredCv,
  ad: JobAd,
): Promise<GeneratedDocs> {
  const response = await gemini.models.generateContent({
    model: MODEL,
    contents: `Du hjälper en jobbsökande att ta fram ansökningshandlingar på svenska för en specifik jobbannons.

Kandidatprofil (JSON):
${JSON.stringify(cv)}

Jobbannons:
Titel: ${ad.jobTitle}
Arbetsgivare: ${ad.employer}
${ad.rawAdText}

Skriv:
1. cvContentHtml: Ett skräddarsytt CV-innehåll som lyfter fram den erfarenhet och de kompetenser som är mest relevanta för just denna annons. Formatera som HTML-fragment med <h2>, <p>, <ul>/<li> - ingen <html>/<body>-tagg.
2. coverLetterHtml: Ett personligt brev anpassat efter annonsen, professionellt men personligt. Formatera som HTML-fragment med <p>-taggar.`,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(GeneratedDocsSchema),
      thinkingConfig: { thinkingBudget: -1 },
    },
  });

  assertGeminiOk(response);

  const parsed = GeneratedDocsSchema.safeParse(JSON.parse(response.text ?? ""));
  if (!parsed.success) {
    throw new Error(
      "Kunde inte tolka Gemini-svaret till CV + personligt brev",
    );
  }

  return {
    cvContentHtml: sanitizeGeneratedHtml(parsed.data.cvContentHtml),
    coverLetterHtml: sanitizeGeneratedHtml(parsed.data.coverLetterHtml),
  };
}
