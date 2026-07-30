const JOBTECH_BASE_URL = "https://jobsearch.api.jobtechdev.se/search";

export type JobAd = {
  externalJobId: string;
  jobTitle: string;
  employer: string;
  url: string;
  rawAdText: string;
  deadline: Date | null;
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
  roles: string[],
  locations: string[],
  limit = 20,
): Promise<JobAd[]> {
  const query = [...roles, ...locations].join(" ");
  const url = `${JOBTECH_BASE_URL}?q=${encodeURIComponent(query)}&limit=${limit}`;

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
