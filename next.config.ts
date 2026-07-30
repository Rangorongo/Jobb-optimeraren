import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (via pdfjs-dist) resolves its worker script relative to its own
  // module location at runtime; Turbopack bundling that into a combined
  // server chunk breaks that resolution ("Cannot find module pdf.worker.mjs").
  // Excluding it keeps its file layout intact.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
