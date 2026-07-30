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

    const ads = await searchJobs({
      roles: ["frontend-utvecklare"],
      municipalityIds: ["AvNB_uwa_6n6"],
      employmentTypes: [],
    });

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

  it("builds municipality, employment-type, worktime-extent and trainee query params", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ hits: [] }) });
    vi.stubGlobal("fetch", fetchMock);

    await searchJobs({
      roles: ["utvecklare"],
      municipalityIds: ["AvNB_uwa_6n6", "PVZL_BQT_XtL"],
      employmentTypes: ["PERMANENT", "PART_TIME", "INTERNSHIP"],
    });

    const calledUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(calledUrl.searchParams.getAll("municipality")).toEqual([
      "AvNB_uwa_6n6",
      "PVZL_BQT_XtL",
    ]);
    expect(calledUrl.searchParams.get("employment-type")).toBe("kpPX_CNN_gDU");
    expect(calledUrl.searchParams.get("worktime-extent")).toBe("947z_JGS_Uk2");
    expect(calledUrl.searchParams.get("trainee")).toBe("true");
  });

  it("omits the q param when roles is empty (e.g. students)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ hits: [] }) });
    vi.stubGlobal("fetch", fetchMock);

    await searchJobs({
      roles: [],
      municipalityIds: ["AvNB_uwa_6n6"],
      employmentTypes: ["INTERNSHIP"],
    });

    const calledUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(calledUrl.searchParams.has("q")).toBe(false);
  });

  it("throws when the API responds with an error status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(
      searchJobs({
        roles: ["utvecklare"],
        municipalityIds: ["AvNB_uwa_6n6"],
        employmentTypes: [],
      }),
    ).rejects.toThrow();
  });
});
