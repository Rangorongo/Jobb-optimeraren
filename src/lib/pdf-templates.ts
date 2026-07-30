export function cvHtmlTemplate(candidateName: string, contentHtml: string) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Georgia, serif; color: #1a1a1a; line-height: 1.5; padding: 0 8px; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  h2 { font-size: 16px; margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  ul { padding-left: 20px; }
</style>
</head>
<body>
<h1>${candidateName}</h1>
${contentHtml}
</body>
</html>`;
}

export function coverLetterHtmlTemplate(contentHtml: string) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6; max-width: 700px; padding: 0 8px; }
  p { margin-bottom: 12px; }
</style>
</head>
<body>
${contentHtml}
</body>
</html>`;
}
