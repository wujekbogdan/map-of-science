import { describe, it, expect } from "vitest";
import { clusterDataSchema } from "./schema.js";

describe("clusterDataSchema", () => {
  it("should parse valid cluster data", () => {
    const input = {
      id: 42,
      totalArticles: 100,
      articles: {
        core: ["Title A", "Title B"],
        review: ["Title C"],
        highlyCited: ["Title D"],
      },
    };

    const result = clusterDataSchema.parse(input);

    expect(result).toEqual({
      id: "42",
      totalArticles: 100,
      titles: ["Title A", "Title B", "Title C", "Title D"],
    });
  });

  it("should deduplicate titles across categories", () => {
    const input = {
      id: 1,
      totalArticles: 50,
      articles: {
        core: ["Shared Title", "Core Only"],
        review: ["Shared Title", "Review Only"],
        highlyCited: ["Shared Title", "HighlyCited Only"],
      },
    };

    const result = clusterDataSchema.parse(input);

    expect(result.titles).toEqual([
      "Shared Title",
      "Core Only",
      "Review Only",
      "HighlyCited Only",
    ]);
  });

  it("should handle partially empty article arrays", () => {
    const input = {
      id: 0,
      totalArticles: 1,
      articles: {
        core: ["Only Title"],
        review: [],
        highlyCited: [],
      },
    };

    const result = clusterDataSchema.parse(input);

    expect(result.titles).toEqual(["Only Title"]);
  });

  it("should reject missing article arrays", () => {
    const input = {
      id: 5,
      totalArticles: 10,
      articles: {},
    };

    expect(() => clusterDataSchema.parse(input)).toThrow();
  });

  it("should reject invalid id type", () => {
    const input = {
      id: "not-a-number",
      totalArticles: 100,
      articles: { core: [], review: [], highlyCited: [] },
    };

    expect(() => clusterDataSchema.parse(input)).toThrow();
  });

  it("should reject clusters with no titles", () => {
    const input = {
      id: 1,
      totalArticles: 0,
      articles: { core: [], review: [], highlyCited: [] },
    };

    expect(() => clusterDataSchema.parse(input)).toThrow("no titles");
  });
});
