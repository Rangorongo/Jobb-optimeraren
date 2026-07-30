"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInterviewGuide } from "@/lib/interview-guide";

const VALID_STATUSES = ["FORESLAGEN", "ANSOKT", "INTERVJU", "AVSLAG"] as const;
type JobMatchStatus = (typeof VALID_STATUSES)[number];

export async function updateJobMatchStatus(
  jobMatchId: string,
  status: JobMatchStatus,
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Inte inloggad");
  }
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Ogiltig status");
  }

  await prisma.jobMatch.updateMany({
    where: { id: jobMatchId, userId: session.user.id },
    data: { status },
  });

  revalidatePath("/dashboard");
}

export async function submitInterviewInvitation(
  jobMatchId: string,
  invitationText: string,
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Inte inloggad");
  }
  if (!invitationText.trim()) {
    throw new Error("Klistra in kallelsetexten");
  }

  const jobMatch = await prisma.jobMatch.findFirst({
    where: { id: jobMatchId, userId: session.user.id },
  });
  if (!jobMatch) {
    throw new Error("Hittade inte ansökan");
  }

  const guideContent = await generateInterviewGuide(jobMatch, invitationText);

  await prisma.$transaction([
    prisma.interviewGuide.upsert({
      where: { jobMatchId },
      update: { invitationText, guideContent },
      create: { jobMatchId, invitationText, guideContent },
    }),
    prisma.jobMatch.update({
      where: { id: jobMatchId },
      data: { status: "INTERVJU" },
    }),
  ]);

  revalidatePath("/dashboard");
  return guideContent;
}
