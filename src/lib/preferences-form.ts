import type { EmploymentType } from "./employment-types";
import type { JobSearchPreferences } from "./jobtech";

const VALID_EMPLOYMENT_TYPES: EmploymentType[] = [
  "PERMANENT",
  "PART_TIME",
  "HOURLY",
  "INTERNSHIP",
];

export type ParsePreferencesResult =
  | { ok: true; preferences: JobSearchPreferences }
  | { ok: false; error: string };

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

  return { ok: true, preferences: { roles, municipalityIds, employmentTypes } };
}
