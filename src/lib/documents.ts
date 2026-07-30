import { anthropic, type StructuredCv } from "./anthropic";
import type { JobAd } from "./jobtech";

const MODEL = "claude-opus-5";

export type GeneratedDocs = {
  cvContentHtml: string;
  coverLetterHtml: string;
};

const CV_MARKER = "===CV===";
const COVER_LETTER_MARKER = "===BREV===";

export async function generateApplicationDocuments(
  cv: StructuredCv,
  ad: JobAd,
): Promise<GeneratedDocs> {
  const response = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: 8192,
    thinking: { type: "adaptive" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages: [
      {
        role: "user",
        content: `Du hjälper en jobbsökande att ta fram ansökningshandlingar på svenska för en specifik jobbannons.

Kandidatprofil (JSON):
${JSON.stringify(cv)}

Jobbannons:
Titel: ${ad.jobTitle}
Arbetsgivare: ${ad.employer}
${ad.rawAdText}

Skriv:
1. Ett skräddarsytt CV-innehåll som lyfter fram den erfarenhet och de kompetenser som är mest relevanta för just denna annons. Formatera som HTML-fragment med <h2>, <p>, <ul>/<li> - ingen <html>/<body>-tagg.
2. Ett personligt brev anpassat efter annonsen, professionellt men personligt. Formatera som HTML-fragment med <p>-taggar.

Svara EXAKT i detta format, utan text före eller efter:
${CV_MARKER}
<CV-innehållet här>
${COVER_LETTER_MARKER}
<Personligt brev här>`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Claude vägrade generera ansökningshandlingarna");
  }

  const textBlock = response.content.find((block) => block.type === "text");
  const text = textBlock && "text" in textBlock ? textBlock.text : "";

  const cvStart = text.indexOf(CV_MARKER);
  const coverStart = text.indexOf(COVER_LETTER_MARKER);
  if (cvStart === -1 || coverStart === -1) {
    throw new Error("Kunde inte tolka Claudes svar till CV + personligt brev");
  }

  return {
    cvContentHtml: text.slice(cvStart + CV_MARKER.length, coverStart).trim(),
    coverLetterHtml: text.slice(coverStart + COVER_LETTER_MARKER.length).trim(),
  };
}
