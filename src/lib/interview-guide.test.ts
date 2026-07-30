import { beforeEach, describe, expect, it, vi } from "vitest";

const createMock = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  class FakeAnthropic {
    beta = { messages: { create: createMock } };
  }
  return { default: FakeAnthropic };
});

const { generateInterviewGuide } = await import("./interview-guide");

const jobMatch = {
  jobTitle: "Frontend-utvecklare",
  employer: "Acme AB",
  rawAdText: "Vi söker en frontend-utvecklare med React-erfarenhet.",
};

describe("generateInterviewGuide", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it("returns the sanitized guide content from Claude", async () => {
    createMock.mockResolvedValue({
      stop_reason: "end_turn",
      content: [
        {
          type: "text",
          text: "<h2>Om företaget</h2><p>Acme AB.</p><script>alert(1)</script>",
        },
      ],
    });

    const guide = await generateInterviewGuide(
      jobMatch,
      "Du är kallad till en intervju nästa vecka.",
    );

    expect(guide).toContain("<h2>Om företaget</h2>");
    expect(guide).not.toContain("<script>");
  });

  it("throws when Claude refuses to generate the guide", async () => {
    createMock.mockResolvedValue({ stop_reason: "refusal", content: [] });

    await expect(
      generateInterviewGuide(jobMatch, "Kallelsetext"),
    ).rejects.toThrow();
  });
});
