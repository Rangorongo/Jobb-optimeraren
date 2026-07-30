import { beforeEach, describe, expect, it, vi } from "vitest";

const parseMock = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  class FakeAnthropic {
    messages = { parse: parseMock };
  }
  return { default: FakeAnthropic };
});

const { structureCv } = await import("./anthropic");

describe("structureCv", () => {
  beforeEach(() => {
    parseMock.mockReset();
  });

  it("returns the structured CV parsed by Claude", async () => {
    const fakeCv = {
      fullName: "Anna Andersson",
      summary: "Erfaren frontend-utvecklare.",
      skills: ["React", "TypeScript"],
      experience: [],
      education: [],
      languages: ["Svenska", "Engelska"],
    };
    parseMock.mockResolvedValue({ parsed_output: fakeCv });

    const result = await structureCv("Anna Andersson\nFrontend-utvecklare...");

    expect(result).toEqual(fakeCv);
    expect(parseMock).toHaveBeenCalledTimes(1);
    expect(parseMock.mock.calls[0][0].model).toBe("claude-opus-5");
  });

  it("throws when Claude does not return valid structured output", async () => {
    parseMock.mockResolvedValue({ parsed_output: null });

    await expect(structureCv("some cv text")).rejects.toThrow();
  });
});
