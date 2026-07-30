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
      <h1 className="mb-6 text-xl font-semibold">Dina ansökningar</h1>
      <KanbanBoard matches={matches} />
    </div>
  );
}
