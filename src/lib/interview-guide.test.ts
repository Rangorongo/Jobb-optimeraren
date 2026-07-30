import { beforeEach, describe, expect, it, vi } from "vitest";

const generateContentMock = vi.fn();

vi.mock("@google/genai", () => {
  class FakeGoogleGenAI {
    models = { generateContent: generateContentMock };
  }
  return { GoogleGenAI: FakeGoogleGenAI };
});

const { generateInterviewGuide } = await import("./interview-guide");

const jobMatch = {
  jobTitle: "Frontend-utvecklare",
  employer: "Acme AB",
  rawAdText: "Vi söker en frontend-utvecklare med React-erfarenhet.",
};

describe("generateInterviewGuide", () => {
  beforeEach(() => {
    generateContentMock.mockReset();
  });

  it("returns the sanitized guide content from Gemini", async () => {
    generateContentMock.mockResolvedValue({
      candidates: [{ finishReason: "STOP" }],
      text: "<h2>Om företaget</h2><p>Acme AB.</p><script>alert(1)</script>",
    });

    const guide = await generateInterviewGuide(
      jobMatch,
      "Du är kallad till en intervju nästa vecka.",
    );

    expect(guide).toContain("<h2>Om företaget</h2>");
    expect(guide).not.toContain("<script>");
  });

  it("strips a markdown code fence Gemini sometimes wraps the HTML in", async () => {
    generateContentMock.mockResolvedValue({
      candidates: [{ finishReason: "STOP" }],
      text: "```html\n<h2>Om företaget</h2><p>Acme AB.</p>\n```",
    });

    const guide = await generateInterviewGuide(jobMatch, "Kallelsetext");

    expect(guide).toBe("<h2>Om företaget</h2><p>Acme AB.</p>");
  });

  it("throws when Gemini blocks the response", async () => {
    generateContentMock.mockResolvedValue({
      candidates: [{ finishReason: "SAFETY" }],
      text: "",
    });

    await expect(
      generateInterviewGuide(jobMatch, "Kallelsetext"),
    ).rejects.toThrow();
  });
});
