import { readFile } from "fs/promises";
import path from "path";
import { NextResponse, type NextRequest } from "next/server";

const UPLOAD_DIR = path.resolve(process.cwd(), "storage", "uploads");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  // Resolve and verify the path stays inside UPLOAD_DIR before touching the
  // filesystem - segments come from the URL and could otherwise be used for
  // path traversal (e.g. "..%2F..%2F...").
  const resolved = path.resolve(UPLOAD_DIR, ...segments);
  if (!resolved.startsWith(UPLOAD_DIR + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const data = await readFile(resolved);
    return new NextResponse(new Uint8Array(data), {
      headers: { "Content-Type": "application/pdf" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
