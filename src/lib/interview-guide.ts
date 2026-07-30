import { anthropic } from "./anthropic";
import { sanitizeGeneratedHtml } from "./sanitize";

const MODEL = "claude-opus-5";

type JobMatchInfo = {
  jobTitle: string;
  employer: string;
  rawAdText: string;
};

export async function generateInterviewGuide(
  jobMatch: JobMatchInfo,
  invitationText: string,
): Promise<string> {
  const response = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages: [
      {
        role: "user",
        content: `Kandidaten har blivit kallad till en anställningsintervju. Ta fram en intervjuguide på svenska baserat på kallelsen och jobbannonsen nedan.

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
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Claude vägrade generera intervjuguiden");
  }

  const textBlock = response.content.find((block) => block.type === "text");
  const content = textBlock && "text" in textBlock ? textBlock.text : "";
  if (!content.trim()) {
    throw new Error("Claude returnerade ingen intervjuguide");
  }

  return sanitizeGeneratedHtml(content.trim());
}
