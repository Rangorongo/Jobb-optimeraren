import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const anthropic = new Anthropic();

const MODEL = "claude-opus-5";

export const StructuredCvSchema = z.object({
  fullName: z.string(),
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      title: z.string(),
      employer: z.string(),
      startDate: z.string(),
      endDate: z.string().nullable(),
      description: z.string(),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      startDate: z.string(),
      endDate: z.string().nullable(),
    }),
  ),
  languages: z.array(z.string()),
});

export type StructuredCv = z.infer<typeof StructuredCvSchema>;

export async function structureCv(rawCvText: string): Promise<StructuredCv> {
  const response = await anthropic.messages.parse({
    model: MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: zodOutputFormat(StructuredCvSchema),
    },
    messages: [
      {
        role: "user",
        content: `Extrahera strukturerad information från följande CV-text och fyll i schemat. Om ett fält saknas i CV:t, gör en rimlig tolkning eller lämna listan tom.\n\n${rawCvText}`,
      },
    ],
  });

  if (!response.parsed_output) {
    throw new Error("Claude kunde inte strukturera CV:t till giltig JSON");
  }

  return response.parsed_output;
}
