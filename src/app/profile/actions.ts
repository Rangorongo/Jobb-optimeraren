"use server";

import { revalidatePath } from "next/cache";
import { requireValidSessionUserId } from "@/lib/session";
import { structureCv } from "@/lib/gemini";
import { extractTextFromPdf } from "@/lib/cv-file";
import { uploadFile } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { parsePreferencesFromFormData } from "@/lib/preferences-form";

export type ProfileState = {
  error: string | null;
  success?: boolean;
};

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
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

  let masterCvFileUrl: string | undefined;
  let structuredCv: unknown;

  if (cvFile && cvFile.size > 0) {
    const buffer = Buffer.from(await cvFile.arrayBuffer());
    masterCvFileUrl = await uploadFile(
      `cv/${userId}-${Date.now()}.pdf`,
      buffer,
      "application/pdf",
    );

    try {
      const cvText = await extractTextFromPdf(buffer);
      structuredCv = await structureCv(cvText);
    } catch (err) {
      console.error(`CV-strukturering misslyckades för user ${userId}`, err);
    }
  }

  await prisma.profile.update({
    where: { userId },
    data: {
      preferences,
      ...(masterCvFileUrl ? { masterCvFileUrl } : {}),
      ...(structuredCv ? { structuredCv } : {}),
    },
  });

  revalidatePath("/profile");
  return { error: null, success: true };
}
