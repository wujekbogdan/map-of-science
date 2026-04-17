import { describe, expect, it, vi } from "vitest";
import type { Cluster } from "../clusters/clusters.js";
import { createSearch } from "./search.js";

const buildMatch = (id: string, score: number) =>
  ({
    id,
    externalId: 0,
    position: { x: 0, y: 0 },
    name: null,
    nameSource: null,
    articlesCount: 0,
    growthRating: 0,
    embedding: { model: "gemini-embedding-001", source: "article-titles" },
    keyConcepts: [],
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
    expect(findByVector).toHaveBeenNthCalledWith(1, { vector, limit: 50 });
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

    expect(findByVector).toHaveBeenNthCalledWith(1, { vector, limit: 5 });
  });
});
