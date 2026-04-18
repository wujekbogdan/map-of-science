import { describe, it, expect, beforeAll } from "vitest";
import { createFetchWorks } from "./works.js";

describe("fetchWorks", () => {
  const apiKey = process.env.OPENALEX_API_KEY;
  const email = process.env.OPENALEX_EMAIL;

  beforeAll(() => {
    if (!apiKey || !email) {
      throw new Error("OPENALEX_API_KEY and OPENALEX_EMAIL required");
    }
  });

  const createClient = () =>
    createFetchWorks({ apiKey: apiKey!, email: email! });

  it("should fetch work with abstract", async () => {
    const fetchWorks = createClient();
    const works = await fetchWorks(["https://doi.org/10.3390/cryst11070814"]);

    expect(works).toHaveLength(1);
    const [work] = works;

    expect(work.id).toBe("https://openalex.org/W3180972658");
    expect(work.doi).toBe("https://doi.org/10.3390/cryst11070814");
    expect(work.title).toBe(
      "The Progress of Additive Engineering for CH3NH3PbI3 Photo-Active Layer in the Context of Perovskite Solar Cells",
    );
    expect(work.abstract).toMatch(/^Methylammonium lead triiodide/);
  });

  it("should fetch multiple works", async () => {
    const fetchWorks = createClient();
    const works = await fetchWorks([
      "https://doi.org/10.1038/s41560-019-0538-4",
      "https://doi.org/10.1038/s41586-021-03964-8",
    ]);

    expect(works).toHaveLength(2);
  });

  it("should return empty array for empty input", async () => {
    const fetchWorks = createClient();
    const works = await fetchWorks([]);

    expect(works).toEqual([]);
  });

  it("should return empty array for non-existent DOIs", async () => {
    const fetchWorks = createClient();
    const works = await fetchWorks([
      "https://doi.org/10.1234/nonexistent-doi-12345",
    ]);

    expect(works).toEqual([]);
  });
});
