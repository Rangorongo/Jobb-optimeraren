import { beforeEach, describe, expect, it, vi } from "vitest";

const generateContentMock = vi.fn();

vi.mock("@google/genai", () => {
  class FakeGoogleGenAI {
    models = { generateContent: generateContentMock };
  }
  return { GoogleGenAI: FakeGoogleGenAI };
});

const { structureCv } = await import("./gemini");

describe("structureCv", () => {
  beforeEach(() => {
    generateContentMock.mockReset();
  });

  it("returns the structured CV parsed from Gemini's JSON response", async () => {
    const fakeCv = {
      fullName: "Anna Andersson",
      summary: "Erfaren frontend-utvecklare.",
      skills: ["React", "TypeScript"],
      experience: [],
      education: [],
      languages: ["Svenska", "Engelska"],
    };
    generateContentMock.mockResolvedValue({
      candidates: [{ finishReason: "STOP" }],
      text: JSON.stringify(fakeCv),
    });

    const result = await structureCv("Anna Andersson\nFrontend-utvecklare...");

    expect(result).toEqual(fakeCv);
    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });

  it("throws when Gemini blocks the prompt", async () => {
    generateContentMock.mockResolvedValue({
      promptFeedback: { blockReason: "SAFETY" },
      candidates: [],
    });

    await expect(structureCv("some cv text")).rejects.toThrow();
  });

  it("throws when Gemini returns invalid JSON for the schema", async () => {
    generateContentMock.mockResolvedValue({
      candidates: [{ finishReason: "STOP" }],
      text: JSON.stringify({ not: "a valid cv" }),
    });

    await expect(structureCv("some cv text")).rejects.toThrow();
  });
});
