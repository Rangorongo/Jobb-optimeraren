import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Prototype stand-in for cloud object storage (Cloudflare R2/S3). Files are
// written outside of public/ (Next.js's static file serving doesn't pick up
// files created after the server starts) and served back through
// /api/files/[...path] instead. Swap this out for a real object store before
// deploying anywhere that doesn't keep a persistent local disk across
// instances.
const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

export async function uploadFile(
  key: string,
  body: Buffer,
  _contentType: string,
): Promise<string> {
  const filePath = path.join(UPLOAD_DIR, ...key.split("/"));
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, body);
  return `/api/files/${key}`;
}
