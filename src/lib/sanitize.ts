import sanitizeHtml from "sanitize-html";

export function sanitizeGeneratedHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["h2", "p", "ul", "ol", "li", "strong", "em", "br"],
    allowedAttributes: {},
  });
}
