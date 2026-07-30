export type JobMatchStatus = "FORESLAGEN" | "ANSOKT" | "INTERVJU" | "AVSLAG";

export type JobMatchDto = {
  id: string;
  jobTitle: string;
  employer: string;
  url: string;
  status: JobMatchStatus;
  deadline: Date | null;
  documents: { id: string; type: "CV" | "COVER_LETTER"; pdfUrl: string }[];
  interviewGuide: { guideContent: string } | null;
};
