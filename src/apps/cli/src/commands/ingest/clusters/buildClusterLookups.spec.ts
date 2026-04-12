import { describe, expect, it } from "vitest";
import { buildClusterLookups } from "./buildClusterLookups.js";

const clustersRow = {
  cluster_id: "42",
  x: "10.5",
  y: "-5.25",
  num_recent_articles: "123",
  cluster_category: "5",
  growth_rating: "42",
  key_concepts: "1,2,3",
};

const namesRow = {
  cluster_id: "42",
  "en-US": "LLM en",
  "pl-PL": "LLM pl",
};

const placesRow = { id: "place-uuid-1", cluster_id: "42" };

const entitiesRow = {
  id: "place-uuid-1",
  "en-US": "Curated en",
  "pl-PL": "Curated pl",
};

describe("buildClusterLookups", () => {
  it("should index cluster positions by cluster_id with numeric fields", () => {
    const lookups = buildClusterLookups({
      clustersRows: [clustersRow],
      llmNameRows: [],
      placesRows: [],
      entityNameRows: [],
    });
    expect(lookups.positions.get("42")).toEqual({
      x: 10.5,
      y: -5.25,
      articlesCount: 123,
      growthRating: 42,
    });
  });

  it("should index llm names by cluster_id using underscore locale keys", () => {
    const lookups = buildClusterLookups({
      clustersRows: [],
      llmNameRows: [namesRow],
      placesRows: [],
      entityNameRows: [],
    });
    expect(lookups.llmNames.get("42")).toEqual({
      en_US: "LLM en",
      pl_PL: "LLM pl",
    });
  });

  it("should index curated names by cluster_id via the places binding", () => {
    const lookups = buildClusterLookups({
      clustersRows: [],
      llmNameRows: [],
      placesRows: [placesRow],
      entityNameRows: [entitiesRow],
    });
    expect(lookups.curatedNames.get("42")).toEqual({
      en_US: "Curated en",
      pl_PL: "Curated pl",
    });
  });

  it("should skip places whose entity id has no i18n entry", () => {
    const lookups = buildClusterLookups({
      clustersRows: [],
      llmNameRows: [],
      placesRows: [placesRow],
      entityNameRows: [],
    });
    expect(lookups.curatedNames.size).toBe(0);
  });
});
