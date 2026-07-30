import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ProfilePreferences } from "@/lib/preferences-form";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    redirect("/onboarding");
  }

  const preferences = profile.preferences as Partial<ProfilePreferences>;
  const student = preferences.student;

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold">Din profil</h1>
      <ProfileForm
        defaultRoles={preferences.roles?.join(", ") ?? ""}
        defaultMunicipalityIds={preferences.municipalityIds ?? []}
        defaultEmploymentTypes={preferences.employmentTypes ?? []}
        defaultIsStudent={student?.isStudent ?? false}
        defaultEducationLevel={student?.educationLevel ?? null}
        defaultGymnasieProgram={student?.gymnasieProgram ?? ""}
        defaultEducationName={student?.educationName ?? ""}
        defaultInstitutionName={student?.institutionName ?? ""}
        masterCvFileUrl={profile.masterCvFileUrl}
      />
    </div>
  );
}
