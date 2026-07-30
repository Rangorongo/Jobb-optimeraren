"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { structureCv } from "@/lib/gemini";
import { extractTextFromPdf } from "@/lib/cv-file";
import { uploadFile } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

export type OnboardingState = {
  error: string | null;
};

export async function submitOnboarding(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Du måste vara inloggad." };
  }

  const roles = String(formData.get("roles") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const locations = String(formData.get("locations") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const cvFile = formData.get("cv") as File | null;

  if (roles.length === 0 || locations.length === 0) {
    return { error: "Ange minst en roll och en ort." };
  }
  if (!cvFile || cvFile.size === 0) {
    return { error: "Ladda upp ditt CV som PDF." };
  }

  const buffer = Buffer.from(await cvFile.arrayBuffer());
  const masterCvFileUrl = await uploadFile(
    `cv/${session.user.id}-${Date.now()}.pdf`,
    buffer,
    "application/pdf",
  );

  let structuredCv = null;
  try {
    const cvText = await extractTextFromPdf(buffer);
    structuredCv = await structureCv(cvText);
  } catch {
    // CV-parsing misslyckades - blockera inte onboarding, spara utan strukturerad data.
    // Kunden kan komplettera profilen manuellt senare.
  }

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {
      preferences: { roles, locations },
      masterCvFileUrl,
      structuredCv: structuredCv ?? undefined,
    },
    create: {
      userId: session.user.id,
      preferences: { roles, locations },
      masterCvFileUrl,
      structuredCv: structuredCv ?? undefined,
    },
  });

  redirect("/dashboard");
}
