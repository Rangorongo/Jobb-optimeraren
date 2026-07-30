import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Inloggad som {session?.user?.email}. Kanban-vyn byggs i nästa steg.
      </p>
    </div>
  );
}
