import { describe, expect, it, vi } from "vitest";
import type { Cluster } from "../clusters/clusters.js";
import { createSearch } from "./search.js";

const buildMatch = (id: string, score: number, articlesCount = 0) =>
  ({
    id,
    externalId: 0,
    position: { x: 0, y: 0 },
    name: null,
    nameSource: null,
    articlesCount,
    growthRating: 0,
    embedding: { model: "gemini-embedding-001", source: "article-titles" },
    keyConcepts: [],
    averageArticleAgeYears: 0,
    citationRating: 0,
    patentRating: 0,
    topJournals: [],
    topInstitutions: [],
    topCompanies: [],
    articles: { core: [], review: [], highlyCited: [] },
    relatedClusters: { topCiting: [], topCited: [] },
    score,
  }) satisfies Cluster & { score: number };

describe("createSearch", () => {
  it("should embed the query and forward the vector to findByVector", async () => {
    const vector = [0.1, 0.2, 0.3];
    const embedQuery = vi.fn().mockResolvedValueOnce(vector);
    const findByVector = vi
      .fn()
      .mockResolvedValueOnce([buildMatch("c-1", 0.95)]);

    const search = createSearch({
      clusters: { findByVector },
      embedQuery,
    });

    const results = await search.query({ text: "quantum computing" });

    expect(embedQuery).toHaveBeenCalledTimes(1);
    expect(embedQuery).toHaveBeenNthCalledWith(1, "quantum computing");
    expect(findByVector).toHaveBeenCalledTimes(1);
    expect(findByVector).toHaveBeenNthCalledWith(1, {
      vector,
      limit: 50,
      minScore: 0.65,
    });
    expect(results).toHaveLength(1);
  });

  it("should use the caller-provided limit when set", async () => {
    const vector = [0];
    const findByVector = vi.fn().mockResolvedValueOnce([]);
    const search = createSearch({
      clusters: { findByVector },
      embedQuery: vi.fn().mockResolvedValueOnce(vector),
    });

    await search.query({ text: "anything", limit: 5 });

    expect(findByVector).toHaveBeenNthCalledWith(1, {
      vector,
      limit: 5,
      minScore: 0.65,
    });
  });

  it("should use the caller-provided minScore when set", async () => {
    const vector = [0];
    const findByVector = vi.fn().mockResolvedValueOnce([]);
    const search = createSearch({
      clusters: { findByVector },
      embedQuery: vi.fn().mockResolvedValueOnce(vector),
    });

    await search.query({ text: "anything", minScore: 0.9 });

    expect(findByVector).toHaveBeenNthCalledWith(1, {
      vector,
      limit: 50,
      minScore: 0.9,
    });
  });

  it.each([
    ["desc", ["c-2", "c-3", "c-1"]],
    ["asc", ["c-1", "c-3", "c-2"]],
  ] as const)(
    "should re-rank by articlesCount %s when sort kind is articlesCount",
    async (direction, expectedIds) => {
      const findByVector = vi
        .fn()
        .mockResolvedValueOnce([
          buildMatch("c-1", 0.95, 100),
          buildMatch("c-2", 0.9, 500),
          buildMatch("c-3", 0.85, 300),
        ]);
      const search = createSearch({
        clusters: { findByVector },
        embedQuery: vi.fn().mockResolvedValueOnce([0]),
      });

      const results = await search.query({
        text: "anything",
        sort: { kind: "articlesCount", direction },
      });

      expect(results.map((match) => match.id)).toEqual(expectedIds);
    },
  );
});
