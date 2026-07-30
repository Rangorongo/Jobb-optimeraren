import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./jobtech", () => ({
  searchJobs: vi.fn(async () => [
    {
      externalJobId: "fixture-1",
      jobTitle: "Frontend-utvecklare",
      employer: "Fixture AB",
      url: "https://example.com/job/1",
      rawAdText:
        "Vi söker en erfaren frontend-utvecklare med React-kompetens.",
      deadline: null,
    },
  ]),
}));

vi.mock("./matching", () => ({
  scoreJobMatches: vi.fn(async (_cv: unknown, ads: { externalJobId: string }[]) => {
    const map = new Map<string, number>();
    for (const ad of ads) map.set(ad.externalJobId, 0.9);
    return map;
  }),
}));

vi.mock("./documents", () => ({
  generateApplicationDocuments: vi.fn(async () => ({
    cvContentHtml: "<h2>Erfarenhet</h2><p>Fixture CV-innehåll</p>",
    coverLetterHtml: "<p>Fixture personligt brev.</p>",
  })),
}));

vi.mock("./email", () => ({
  sendNewMatchesEmail: vi.fn(async () => {}),
}));

vi.mock("./storage", () => ({
  uploadFile: vi.fn(async (key: string) => `https://fake-storage.test/${key}`),
}));

const { prisma } = await import("./prisma");
const { runMatchingPipelineForUser } = await import("./pipeline");
const { uploadFile } = await import("./storage");
const { sendNewMatchesEmail } = await import("./email");

describe("runMatchingPipelineForUser (integration)", () => {
  let userId: string;

  beforeEach(async () => {
    vi.mocked(uploadFile).mockClear();
    vi.mocked(sendNewMatchesEmail).mockClear();

    const user = await prisma.user.create({
      data: {
        email: `pipeline-test-${Date.now()}@example.com`,
        authProvider: "google",
        profile: {
          create: {
            preferences: {
              roles: ["frontend-utvecklare"],
              locations: ["Stockholm"],
            },
            structuredCv: {
              fullName: "Fixture Testsson",
              summary: "Erfaren frontend-utvecklare.",
              skills: ["React", "TypeScript"],
              experience: [],
              education: [],
              languages: ["Svenska"],
            },
          },
        },
      },
    });
    userId = user.id;
  });

  afterEach(async () => {
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  });

  it("creates a JobMatch with two rendered PDF documents and sends an email", async () => {
    await runMatchingPipelineForUser(userId);

    const matches = await prisma.jobMatch.findMany({
      where: { userId },
      include: { documents: true },
    });

    expect(matches).toHaveLength(1);
    expect(matches[0].externalJobId).toBe("fixture-1");
    expect(matches[0].status).toBe("FORESLAGEN");
    expect(matches[0].documents).toHaveLength(2);

    // Verify actual PDF bytes were rendered (non-empty) before being "uploaded".
    const uploadCalls = vi.mocked(uploadFile).mock.calls;
    expect(uploadCalls).toHaveLength(2);
    for (const [, body] of uploadCalls) {
      expect(Buffer.isBuffer(body)).toBe(true);
      expect((body as Buffer).length).toBeGreaterThan(0);
    }

    expect(sendNewMatchesEmail).toHaveBeenCalledTimes(1);
  });

  it("does not create duplicate JobMatch rows on a second run", async () => {
    await runMatchingPipelineForUser(userId);
    await runMatchingPipelineForUser(userId);

    const matches = await prisma.jobMatch.findMany({ where: { userId } });
    expect(matches).toHaveLength(1);
  });
});
