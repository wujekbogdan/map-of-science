import { describe, expect, it } from "vitest";
import type { EtoRecord } from "../../../eto/record.js";
import { createBuildCluster, type ClusterLookups } from "./buildCluster.js";

const vector = Array.from({ length: 768 }, () => 0);
const externalId = "42";

const buildRecord = (id: number): EtoRecord => ({
  id,
  averageArticleAgeYears: 24.95,
  citationRatingPercentile: 55.89,
  patentRatingPercentile: 86.03,
  topJournals: ["Nucleic acids research"],
  topInstitutions: ["Kyushu University"],
  topCompanies: [],
  articles: {
    core: [
      {
        title: "Core One",
        metadata: "2023: Journal",
        citations: 12,
        doi: null,
      },
    ],
    review: [],
    highlyCited: [],
  },
  relatedClusters: {
    topCiting: [{ id: 0, significantCitations: 35 }],
    topCited: [],
  },
  titles: ["Core One"],
});

const record = buildRecord(Number(externalId));

const positionRow = {
  x: 10.5,
  y: -5.25,
  articlesCount: 123,
  growthRating: 42,
};

const baseLookups: ClusterLookups = {
  positions: new Map([[externalId, positionRow]]),
  llmNames: new Map(),
  curatedNames: new Map(),
};

describe("buildCluster", () => {
  it("should prefer the curated name when both curated and llm are present", () => {
    const buildCluster = createBuildCluster({
      ...baseLookups,
      curatedNames: new Map([
        [externalId, { en_US: "Curated", pl_PL: "Kurowany" }],
      ]),
      llmNames: new Map([[externalId, { en_US: "LLM", pl_PL: "LLMpl" }]]),
    });
    const cluster = buildCluster({ record, vector });
    expect(cluster?.name).toEqual({ en_US: "Curated", pl_PL: "Kurowany" });
    expect(cluster?.nameSource).toBe("curated");
  });

  it("should fall back to the llm name when curated is missing", () => {
    const buildCluster = createBuildCluster({
      ...baseLookups,
      llmNames: new Map([[externalId, { en_US: "LLM", pl_PL: "LLMpl" }]]),
    });
    const cluster = buildCluster({ record, vector });
    expect(cluster?.nameSource).toBe("llm");
    expect(cluster?.name).toEqual({ en_US: "LLM", pl_PL: "LLMpl" });
  });

  it("should produce a null name and nameSource when neither source has an entry", () => {
    const cluster = createBuildCluster(baseLookups)({ record, vector });
    expect(cluster?.name).toBeNull();
    expect(cluster?.nameSource).toBeNull();
  });

  it("should map position, counts, and embedding metadata from inputs", () => {
    const cluster = createBuildCluster(baseLookups)({ record, vector });
    expect(cluster).toMatchObject({
      externalId: 42,
      position: { x: 10.5, y: -5.25 },
      articlesCount: 123,
      growthRating: 42,
      embedding: { model: "gemini-embedding-001", source: "article-titles" },
      vector,
    });
  });

  it("should return null when there is no position data for the given externalId", () => {
    const cluster = createBuildCluster(baseLookups)({
      record: buildRecord(999),
      vector,
    });
    expect(cluster).toBeNull();
  });

  it("should carry the rich fields from the record, naming related clusters by their ETO id", () => {
    const cluster = createBuildCluster(baseLookups)({ record, vector });
    expect(cluster).toMatchObject({
      averageArticleAgeYears: 24.95,
      citationRating: 55.89,
      patentRating: 86.03,
      topJournals: ["Nucleic acids research"],
      topInstitutions: ["Kyushu University"],
      topCompanies: [],
      articles: record.articles,
      relatedClusters: {
        topCiting: [{ externalId: 0, significantCitations: 35 }],
        topCited: [],
      },
    });
  });

  it("should emit empty keyConcepts", () => {
    const cluster = createBuildCluster(baseLookups)({ record, vector });
    expect(cluster?.keyConcepts).toEqual([]);
  });
});
