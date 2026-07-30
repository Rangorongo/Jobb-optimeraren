"use server";

import { redirect } from "next/navigation";
import { requireValidSessionUserId } from "@/lib/session";
import { structureCv } from "@/lib/gemini";
import { extractTextFromPdf } from "@/lib/cv-file";
import { uploadFile } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { parsePreferencesFromFormData } from "@/lib/preferences-form";

export type OnboardingState = {
  error: string | null;
};

export async function submitOnboarding(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const userId = await requireValidSessionUserId();
  if (!userId) {
    return { error: "Du måste vara inloggad." };
  }

  const parsed = parsePreferencesFromFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }
  const preferences = parsed.preferences;

  const cvFile = formData.get("cv") as File | null;
  if (!cvFile || cvFile.size === 0) {
    return { error: "Ladda upp ditt CV som PDF." };
  }

  const buffer = Buffer.from(await cvFile.arrayBuffer());
  const masterCvFileUrl = await uploadFile(
    `cv/${userId}-${Date.now()}.pdf`,
    buffer,
    "application/pdf",
  );

  let structuredCv = null;
  try {
    const cvText = await extractTextFromPdf(buffer);
    structuredCv = await structureCv(cvText);
  } catch (err) {
    // CV-parsing misslyckades - blockera inte onboarding, spara utan strukturerad data.
    // Kunden kan komplettera profilen manuellt senare.
    console.error(`CV-strukturering misslyckades för user ${userId}`, err);
  }

  await prisma.profile.upsert({
    where: { userId },
    update: {
      preferences,
      masterCvFileUrl,
      structuredCv: structuredCv ?? undefined,
    },
    create: {
      userId,
      preferences,
      masterCvFileUrl,
      structuredCv: structuredCv ?? undefined,
    },
  });

  redirect("/dashboard");
}
