import type { EmploymentType } from "./employment-types";
import type { JobSearchPreferences } from "./jobtech";

const VALID_EMPLOYMENT_TYPES: EmploymentType[] = [
  "PERMANENT",
  "PART_TIME",
  "HOURLY",
  "INTERNSHIP",
];

export type EducationLevel = "GYMNASIUM" | "UNIVERSITY" | "FOLKHOGSKOLA";

const VALID_EDUCATION_LEVELS: EducationLevel[] = [
  "GYMNASIUM",
  "UNIVERSITY",
  "FOLKHOGSKOLA",
];

export type StudentInfo = {
  isStudent: boolean;
  educationLevel: EducationLevel | null;
  gymnasieProgram: string | null;
  educationName: string | null;
  institutionName: string | null;
};

// Combined shape stored in Profile.preferences. JobSearchPreferences drives
// the JobTech query directly; student is contextual candidate info (shown on
// the profile, and available to feed into AI matching/generation later).
export type ProfilePreferences = JobSearchPreferences & { student: StudentInfo };

export type ParsePreferencesResult =
  | { ok: true; preferences: ProfilePreferences }
  | { ok: false; error: string };

function parseStudentInfo(formData: FormData): StudentInfo {
  const isStudent = formData.get("isStudent") === "true";
  if (!isStudent) {
    return {
      isStudent: false,
      educationLevel: null,
      gymnasieProgram: null,
      educationName: null,
      institutionName: null,
    };
  }

  const rawLevel = String(formData.get("educationLevel") ?? "");
  const educationLevel = VALID_EDUCATION_LEVELS.includes(
    rawLevel as EducationLevel,
  )
    ? (rawLevel as EducationLevel)
    : null;

  return {
    isStudent: true,
    educationLevel,
    gymnasieProgram:
      educationLevel === "GYMNASIUM"
        ? String(formData.get("gymnasieProgram") ?? "").trim() || null
        : null,
    educationName:
      educationLevel === "UNIVERSITY" || educationLevel === "FOLKHOGSKOLA"
        ? String(formData.get("educationName") ?? "").trim() || null
        : null,
    institutionName:
      educationLevel === "UNIVERSITY" || educationLevel === "FOLKHOGSKOLA"
        ? String(formData.get("institutionName") ?? "").trim() || null
        : null,
  };
}

export function parsePreferencesFromFormData(
  formData: FormData,
): ParsePreferencesResult {
  const roles = String(formData.get("roles") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const municipalityIds = String(formData.get("municipalityIds") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const employmentTypes = formData
    .getAll("employmentTypes")
    .map(String)
    .filter((v): v is EmploymentType =>
      VALID_EMPLOYMENT_TYPES.includes(v as EmploymentType),
    );

  if (roles.length === 0) {
    return { ok: false, error: "Ange minst en roll." };
  }
  if (municipalityIds.length === 0) {
    return { ok: false, error: "Välj minst en kommun." };
  }

  const student = parseStudentInfo(formData);

  return {
    ok: true,
    preferences: { roles, municipalityIds, employmentTypes, student },
  };
}
