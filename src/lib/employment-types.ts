export type EmploymentType = "PERMANENT" | "PART_TIME" | "HOURLY" | "INTERNSHIP";

export const EMPLOYMENT_TYPE_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: "PERMANENT", label: "Fast anställning" },
  { value: "PART_TIME", label: "Deltid" },
  { value: "HOURLY", label: "Timanställning" },
  { value: "INTERNSHIP", label: "Praktik" },
];

// JobTech (Arbetsformedlingen) taxonomy concept IDs. Looked up via
// https://taxonomy.api.jobtechdev.se/v1/taxonomy/main/concepts?type=employment-type
// and ?type=worktime-extent. INTERNSHIP has no taxonomy concept - JobTech
// exposes it as a phrase-matching boolean query param (`trainee`) instead.
export const EMPLOYMENT_TYPE_CONCEPT_IDS: Record<
  Exclude<EmploymentType, "INTERNSHIP">,
  { param: "employment-type" | "worktime-extent"; id: string }
> = {
  PERMANENT: { param: "employment-type", id: "kpPX_CNN_gDU" }, // Tillsvidareanställning
  HOURLY: { param: "employment-type", id: "1paU_aCR_nGn" }, // Behovsanställning
  PART_TIME: { param: "worktime-extent", id: "947z_JGS_Uk2" }, // Deltid
};
