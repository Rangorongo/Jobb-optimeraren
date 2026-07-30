import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-8 dark:bg-black">
      <h1 className="text-xl font-semibold">Logga in</h1>
      {reason === "session-expired" && (
        <p className="max-w-sm text-center text-sm text-amber-600" role="status">
          Din session har gått ut. Logga in igen.
        </p>
      )}
      <LoginForm />
    </div>
  );
}
