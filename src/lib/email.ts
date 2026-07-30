import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type NewMatchSummary = {
  jobTitle: string;
  employer: string;
};

export async function sendNewMatchesEmail(
  to: string,
  matches: NewMatchSummary[],
) {
  const listHtml = matches
    .map((m) => `<li>${m.jobTitle} — ${m.employer}</li>`)
    .join("");

  await resend.emails.send({
    from: "AI-Copilot <onboarding@resend.dev>",
    to,
    subject: `${matches.length} nya jobbförslag väntar på dig`,
    html: `<p>Vi har hittat ${matches.length} nya jobbförslag åt dig, med skräddarsytt CV och personligt brev redo att granska.</p><ul>${listHtml}</ul><p>Logga in på din dashboard för att se dem.</p>`,
  });
}
