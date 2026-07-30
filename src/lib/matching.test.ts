import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JobAd } from "./jobtech";

const generateContentMock = vi.fn();

vi.mock("@google/genai", () => {
  class FakeGoogleGenAI {
    models = { generateContent: generateContentMock };
  }
  return { GoogleGenAI: FakeGoogleGenAI };
});

const { scoreJobMatches } = await import("./matching");

const fakeCv = {
  fullName: "Anna Andersson",
  summary: "Erfaren frontend-utvecklare.",
  skills: ["React", "TypeScript"],
  experience: [],
  education: [],
  languages: ["Svenska"],
};

const ads: JobAd[] = [
  {
    externalJobId: "job-1",
    jobTitle: "Frontend-utvecklare",
    employer: "Acme AB",
    url: "https://example.com/1",
    rawAdText: "Vi söker en frontend-utvecklare med React-erfarenhet.",
    deadline: null,
  },
  {
    externalJobId: "job-2",
    jobTitle: "Sjuksköterska",
    employer: "Regionen",
    url: "https://example.com/2",
    rawAdText: "Vi söker en legitimerad sjuksköterska.",
    deadline: null,
  },
];

describe("scoreJobMatches", () => {
  beforeEach(() => {
    generateContentMock.mockReset();
  });

  it("returns a score map keyed by externalJobId", async () => {
    generateContentMock.mockResolvedValue({
      candidates: [{ finishReason: "STOP" }],
      text: JSON.stringify({
        matches: [
          { externalJobId: "job-1", score: 0.9 },
          { externalJobId: "job-2", score: 0.1 },
        ],
      }),
    });

    const scores = await scoreJobMatches(fakeCv, ads);

    expect(scores.get("job-1")).toBe(0.9);
    expect(scores.get("job-2")).toBe(0.1);
  });

  it("returns an empty map without calling Gemini when there are no ads", async () => {
    const scores = await scoreJobMatches(fakeCv, []);

    expect(scores.size).toBe(0);
    expect(generateContentMock).not.toHaveBeenCalled();
  });
});
