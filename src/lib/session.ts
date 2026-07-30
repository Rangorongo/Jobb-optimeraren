import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Returns the current session's user ID, but only if that user still exists
 * in the database. A JWT session can outlive its underlying User row (e.g.
 * the local dev database gets reset while a browser still holds an old
 * session cookie) - writing to Profile/JobMatch etc. with a stale userId
 * would otherwise crash with a foreign-key violation. When stale, clears the
 * session and redirects to login instead of surfacing that raw DB error.
 */
export async function requireValidSessionUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const exists = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!exists) {
    await signOut({ redirectTo: "/login?reason=session-expired" });
    return null; // unreachable - signOut() redirects
  }

  return session.user.id;
}
