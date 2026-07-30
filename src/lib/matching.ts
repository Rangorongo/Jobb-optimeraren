import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { anthropic, type StructuredCv } from "./anthropic";
import type { JobAd } from "./jobtech";

const MODEL = "claude-opus-5";

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

  const response = await anthropic.messages.parse({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: zodOutputFormat(ScoredMatchesSchema),
    },
    messages: [
      {
        role: "user",
        content: `Bedöm hur väl varje jobbannons nedan matchar kandidatens profil. Ge varje annons en poäng mellan 0 och 1 (1 = perfekt matchning), baserat på erfarenhet, kompetenser och roll.\n\nKandidatprofil:\n${JSON.stringify(cv)}\n\nAnnonser:\n${adsSummary}`,
      },
    ],
  });

  const scores = new Map<string, number>();
  for (const match of response.parsed_output?.matches ?? []) {
    scores.set(match.externalJobId, match.score);
  }
  return scores;
}
