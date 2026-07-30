import { z } from "zod";
import { assertGeminiOk, gemini, MODEL, type StructuredCv } from "./gemini";
import type { JobAd } from "./jobtech";

const ScoredMatchesSchema = z.object({
  matches: z.array(
    z.object({
      externalJobId: z.string(),
      score: z.number().min(0).max(1),
    }),
  ),
});

export async function scoreJobMatches(
  cv: StructuredCv,
  ads: JobAd[],
): Promise<Map<string, number>> {
  if (ads.length === 0) {
    return new Map();
  }

  const adsSummary = ads
    .map(
      (ad) =>
        `ID: ${ad.externalJobId}\nTitel: ${ad.jobTitle}\nArbetsgivare: ${ad.employer}\nAnnonstext: ${ad.rawAdText.slice(0, 1500)}`,
    )
    .join("\n\n---\n\n");

  const response = await gemini.models.generateContent({
    model: MODEL,
    contents: `Bedöm hur väl varje jobbannons nedan matchar kandidatens profil. Ge varje annons en poäng mellan 0 och 1 (1 = perfekt matchning), baserat på erfarenhet, kompetenser och roll.\n\nKandidatprofil:\n${JSON.stringify(cv)}\n\nAnnonser:\n${adsSummary}`,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(ScoredMatchesSchema),
      thinkingConfig: { thinkingBudget: -1 },
    },
  });

  assertGeminiOk(response);

  const parsed = ScoredMatchesSchema.safeParse(JSON.parse(response.text ?? ""));
  const scores = new Map<string, number>();
  if (!parsed.success) {
    return scores;
  }
  for (const match of parsed.data.matches) {
    scores.set(match.externalJobId, match.score);
  }
  return scores;
}
