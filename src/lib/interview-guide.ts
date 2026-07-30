import { assertGeminiOk, gemini, MODEL } from "./gemini";
import { sanitizeGeneratedHtml } from "./sanitize";

type JobMatchInfo = {
  jobTitle: string;
  employer: string;
  rawAdText: string;
};

// Gemini sometimes wraps plain-text HTML responses in a markdown code fence
// even when not asked to - strip it before sanitizing.
function stripMarkdownCodeFence(text: string): string {
  const match = text.match(/^```(?:html)?\s*\n([\s\S]*?)\n?```\s*$/);
  return match ? match[1] : text;
}

export async function generateInterviewGuide(
  jobMatch: JobMatchInfo,
  invitationText: string,
): Promise<string> {
  const response = await gemini.models.generateContent({
    model: MODEL,
    contents: `Kandidaten har blivit kallad till en anställningsintervju. Ta fram en intervjuguide på svenska baserat på kallelsen och jobbannonsen nedan.

Jobbannons:
Titel: ${jobMatch.jobTitle}
Arbetsgivare: ${jobMatch.employer}
${jobMatch.rawAdText}

Kallelsetext (inklistrad av kandidaten):
${invitationText}

Skriv en intervjuguide som HTML-fragment (ingen <html>/<body>-tagg) med följande sektioner, i denna ordning:
<h2>Om företaget</h2> - kort sammanfattning baserat på vad som går att utläsa av annonsen och kallelsen.
<h2>Troliga intervjufrågor</h2> - en <ul> med 6-10 frågor som sannolikt kommer ställas, baserat på rollen.
<h2>Motfrågor att ställa</h2> - en <ul> med 4-6 bra frågor kandidaten kan ställa till arbetsgivaren.`,
    config: {
      thinkingConfig: { thinkingBudget: -1 },
    },
  });

  assertGeminiOk(response);

  const content = response.text ?? "";
  if (!content.trim()) {
    throw new Error("Gemini returnerade ingen intervjuguide");
  }

  return sanitizeGeneratedHtml(stripMarkdownCodeFence(content.trim()));
}
