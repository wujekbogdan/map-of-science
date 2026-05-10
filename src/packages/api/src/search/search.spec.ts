import { describe, expect, it, vi } from "vitest";
import type { Search } from "@map-of-science/atlas";
import type { AtlasStore } from "@map-of-science/atlas-store";
import { createInnerContext, type Lang } from "../context.js";
import { createCaller } from "../router.js";

const buildMatch = () => ({
  id: "c-1",
  externalId: 1,
  position: { x: 10, y: -5 },
  name: { en_US: "Machine Learning", pl_PL: "Uczenie Maszynowe" },
  nameSource: "llm" as const,
  articlesCount: 1200,
  growthRating: 75.5,
  embedding: { model: "gemini-embedding-001", source: "article-titles" },
  keyConcepts: ["machine learning", "neural networks"],
  score: 0.95,
});

const emptyAtlas = {} as AtlasStore;

const buildSearch = (
  query: Search["query"] = vi.fn().mockResolvedValue([buildMatch()]),
): Search => ({ query });

const callerFor = (lang: Lang, search: Search = buildSearch()) =>
  createCaller(createInnerContext({ lang, atlas: emptyAtlas, search }));

describe("search.query", () => {
  it.each([
    ["en_US", "Machine Learning"],
    ["pl_PL", "Uczenie Maszynowe"],
  ] as const)(
    "should flatten each match's name to %s",
    async (lang, expected) => {
      const result = await callerFor(lang).search.query({ text: "quantum" });
      expect(result[0].name).toBe(expected);
    },
  );

  it("should include displayName on each match", async () => {
    const result = await callerFor("en_US").search.query({ text: "quantum" });
    expect(result[0].displayName).toBe("Machine Learning");
  });

  it("should include keyConcepts on each match", async () => {
    const result = await callerFor("en_US").search.query({ text: "quantum" });
    expect(result[0].keyConcepts).toEqual([
      "machine learning",
      "neural networks",
    ]);
  });

  it("should forward the text, limit, minScore, and sort to search.query", async () => {
    const query = vi.fn().mockResolvedValue([]);
    const search = buildSearch(query);

    await callerFor("en_US", search).search.query({
      text: "physics",
      limit: 5,
      minScore: 0.8,
      sort: { kind: "articlesCount", direction: "desc" },
    });

    expect(query).toHaveBeenNthCalledWith(1, {
      text: "physics",
      limit: 5,
      minScore: 0.8,
      sort: { kind: "articlesCount", direction: "desc" },
    });
  });

  it("should default sort to relevance when not provided", async () => {
    const query = vi.fn().mockResolvedValue([]);
    const search = buildSearch(query);

    await callerFor("en_US", search).search.query({ text: "physics" });

    expect(query).toHaveBeenNthCalledWith(1, {
      text: "physics",
      sort: { kind: "relevance" },
    });
  });
});
