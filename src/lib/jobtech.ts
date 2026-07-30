import {
  EMPLOYMENT_TYPE_CONCEPT_IDS,
  type EmploymentType,
} from "./employment-types";

const JOBTECH_BASE_URL = "https://jobsearch.api.jobtechdev.se/search";

export type JobAd = {
  externalJobId: string;
  jobTitle: string;
  employer: string;
  url: string;
  rawAdText: string;
  deadline: Date | null;
};

export type JobSearchPreferences = {
  roles: string[];
  municipalityIds: string[];
  employmentTypes: EmploymentType[];
};

type JobTechHit = {
  id: string;
  headline: string;
  webpage_url: string;
  application_deadline: string | null;
  employer: { name: string | null } | null;
  description: { text: string | null } | null;
};

type JobTechResponse = {
  hits: JobTechHit[];
};

export async function searchJobs(
  preferences: JobSearchPreferences,
  limit = 20,
): Promise<JobAd[]> {
  const params = new URLSearchParams();
  params.set("q", preferences.roles.join(" "));
  params.set("limit", String(limit));

  for (const municipalityId of preferences.municipalityIds) {
    params.append("municipality", municipalityId);
  }

  for (const employmentType of preferences.employmentTypes) {
    if (employmentType === "INTERNSHIP") {
      params.set("trainee", "true");
      continue;
    }
    const concept = EMPLOYMENT_TYPE_CONCEPT_IDS[employmentType];
    params.append(concept.param, concept.id);
  }

  const url = `${JOBTECH_BASE_URL}?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`JobTech-API svarade med ${response.status}`);
  }

  const data = (await response.json()) as JobTechResponse;

  return data.hits.map((hit) => ({
    externalJobId: hit.id,
    jobTitle: hit.headline,
    employer: hit.employer?.name ?? "Okänd arbetsgivare",
    url: hit.webpage_url,
    rawAdText: hit.description?.text ?? "",
    deadline: hit.application_deadline
      ? new Date(hit.application_deadline)
      : null,
  }));
}
