import { auth, signOut } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-8 dark:bg-black">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        AI-Copilot för Jobbsökande
      </h1>

      {session?.user ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-zinc-600 dark:text-zinc-400">
            Inloggad som {session.user.email}
          </p>
          <a
            href="/dashboard"
            className="rounded-full bg-black px-5 py-3 text-white dark:bg-white dark:text-black"
          >
            Till dashboard
          </a>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button type="submit" className="text-sm underline">
              Logga ut
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <a
            href="/login"
            className="rounded-full bg-black px-5 py-3 text-center text-white dark:bg-white dark:text-black"
          >
            Logga in
          </a>
          <a
            href="/signup"
            className="rounded-full border border-black/[.1] px-5 py-3 text-center dark:border-white/[.15]"
          >
            Skapa konto
          </a>
        </div>
      )}
    </div>
  );
}
