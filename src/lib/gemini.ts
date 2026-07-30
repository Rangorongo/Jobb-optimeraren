import { GoogleGenAI, type GenerateContentResponse } from "@google/genai";
import { z } from "zod";

export const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const MODEL = "gemini-2.5-flash";

export function assertGeminiOk(response: GenerateContentResponse) {
  if (response.promptFeedback?.blockReason) {
    throw new Error(
      `Gemini blockerade förfrågan: ${response.promptFeedback.blockReason}`,
    );
  }
  const finishReason = response.candidates?.[0]?.finishReason;
  if (!response.candidates?.length || finishReason === "SAFETY") {
    throw new Error(`Gemini vägrade svara (finishReason: ${finishReason})`);
  }
}

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
  const response = await gemini.models.generateContent({
    model: MODEL,
    contents: `Extrahera strukturerad information från följande CV-text och fyll i schemat. Om ett fält saknas i CV:t, gör en rimlig tolkning eller lämna listan tom.\n\n${rawCvText}`,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(StructuredCvSchema),
      thinkingConfig: { thinkingBudget: -1 },
    },
  });

  assertGeminiOk(response);

  const parsed = StructuredCvSchema.safeParse(JSON.parse(response.text ?? ""));
  if (!parsed.success) {
    throw new Error("Gemini kunde inte strukturera CV:t till giltig JSON");
  }

  return parsed.data;
}
