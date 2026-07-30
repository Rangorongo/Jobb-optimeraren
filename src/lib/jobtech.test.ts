import { afterEach, describe, expect, it, vi } from "vitest";
import { searchJobs } from "./jobtech";

describe("searchJobs", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps JobTech API hits to JobAd objects", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        hits: [
          {
            id: "31299580",
            headline: "Senior Frontendutvecklare",
            webpage_url: "https://arbetsformedlingen.se/platsbanken/annonser/31299580",
            application_deadline: "2026-08-03T23:59:59",
            employer: { name: "Avaron AB" },
            description: { text: "Vi söker en frontendutvecklare..." },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const ads = await searchJobs(["frontend-utvecklare"], ["Stockholm"]);

    expect(ads).toHaveLength(1);
    expect(ads[0]).toEqual({
      externalJobId: "31299580",
      jobTitle: "Senior Frontendutvecklare",
      employer: "Avaron AB",
      url: "https://arbetsformedlingen.se/platsbanken/annonser/31299580",
      rawAdText: "Vi söker en frontendutvecklare...",
      deadline: new Date("2026-08-03T23:59:59"),
    });
  });

  it("throws when the API responds with an error status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(searchJobs(["utvecklare"], ["Stockholm"])).rejects.toThrow();
  });
});
