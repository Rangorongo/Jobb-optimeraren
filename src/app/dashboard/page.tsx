import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "./KanbanBoard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const matches = await prisma.jobMatch.findMany({
    where: { userId: session.user.id },
    include: { documents: true, interviewGuide: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dina ansökningar</h1>
        <a href="/profile" className="text-sm underline">
          Min profil
        </a>
      </div>
      <KanbanBoard matches={matches} />
    </div>
  );
}
