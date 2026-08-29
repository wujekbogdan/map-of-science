import { describe, expect, it, vi } from "vitest";
import type { Search } from "@map-of-science/atlas";
import type { AtlasStore } from "@map-of-science/atlas-store";
import { createInnerContext, type Lang } from "../context.js";
import { createCaller } from "../router.js";

const buildCluster = () => ({
  id: "c-1",
  externalId: 1,
  position: { x: 10, y: -5 },
  name: { en_US: "Machine Learning", pl_PL: "Uczenie Maszynowe" },
  nameSource: "llm" as const,
  articlesCount: 1200,
  growthRating: 75.5,
  embedding: { model: "gemini-embedding-001", source: "article-titles" },
  keyConcepts: ["machine learning", "neural networks"],
  averageArticleAgeYears: 5.8,
  citationRating: 75.47,
  patentRating: 99.78,
  topJournals: ["Nature"],
  topInstitutions: ["Kyushu University"],
  topCompanies: [],
  articles: { core: [], review: [], highlyCited: [] },
  relatedClusters: {
    topCiting: [
      { externalId: 7, significantCitations: 30 },
      { externalId: 8, significantCitations: 12 },
    ],
    topCited: [
      { externalId: 8, significantCitations: 20 },
      { externalId: 9, significantCitations: 25 },
    ],
  },
});

/* The reader returns the attributes only, so the double must too. */
const buildMapAttributes = () => ({
  id: "c-1",
  externalId: 1,
  position: { x: 10, y: -5 },
  name: { en_US: "Machine Learning", pl_PL: "Uczenie Maszynowe" },
  articlesCount: 1200,
  growthRating: 75.5,
  keyConcepts: ["machine learning", "neural networks"],
});

const buildRelated = (externalId: number, name: string | null) => ({
  id: `c-${externalId.toString()}`,
  externalId,
  name: name === null ? null : { en_US: name, pl_PL: name },
});

const buildAtlas = (
  overrides: {
    clusters?: Partial<AtlasStore["clusters"]>;
    clusterAttributes?: Partial<AtlasStore["clusterAttributes"]>;
  } = {},
): AtlasStore =>
  ({
    clusters: {
      findById: vi.fn().mockResolvedValue(buildCluster()),
      ...overrides.clusters,
    },
    clusterAttributes: {
      findByExternalIds: vi.fn().mockResolvedValue([]),
      findInViewport: vi.fn().mockResolvedValue([buildMapAttributes()]),
      ...overrides.clusterAttributes,
    },
  }) as unknown as AtlasStore;

const emptySearch = {} as Search;

const callerFor = (lang: Lang, atlas: AtlasStore = buildAtlas()) =>
  createCaller(createInnerContext({ lang, atlas, search: emptySearch }));

describe("cluster.byId", () => {
  it.each([
    ["en_US", "Machine Learning"],
    ["pl_PL", "Uczenie Maszynowe"],
  ] as const)(
    "should flatten the cluster name to %s",
    async (lang, expected) => {
      const result = await callerFor(lang).cluster.byId({ id: "c-1" });
      expect(result?.name).toBe(expected);
    },
  );

  it("should return null name when the cluster has no name", async () => {
    const atlas = buildAtlas({
      clusters: {
        findById: vi.fn().mockResolvedValue({ ...buildCluster(), name: null }),
      },
    });

    const result = await callerFor("en_US", atlas).cluster.byId({ id: "c-1" });

    expect(result?.name).toBeNull();
  });

  it("should include keyConcepts in the response", async () => {
    const result = await callerFor("en_US").cluster.byId({ id: "c-1" });
    expect(result?.keyConcepts).toEqual([
      "machine learning",
      "neural networks",
    ]);
  });

  it("should use the localized name as displayName", async () => {
    const result = await callerFor("en_US").cluster.byId({ id: "c-1" });
    expect(result?.displayName).toBe("Machine Learning");
  });

  it.each([
    ["en_US", "Cluster #1"],
    ["pl_PL", "Klaster #1"],
  ] as const)(
    "should display null-name cluster as a localized placeholder in %s",
    async (lang, expected) => {
      const atlas = buildAtlas({
        clusters: {
          findById: vi.fn().mockResolvedValue({
            ...buildCluster(),
            name: null,
          }),
        },
      });

      const result = await callerFor(lang, atlas).cluster.byId({ id: "c-1" });

      expect(result?.displayName).toBe(expected);
    },
  );

  it("should negate position.y to convert to screen-space", async () => {
    const result = await callerFor("en_US").cluster.byId({ id: "c-1" });
    expect(result?.position).toEqual({ x: 10, y: 5 });
  });

  it("should return the panel fields and nothing else", async () => {
    const result = await callerFor("en_US").cluster.byId({ id: "c-1" });

    expect(Object.keys(result ?? {}).toSorted()).toEqual([
      "articles",
      "articlesCount",
      "averageArticleAgeYears",
      "citationRating",
      "displayName",
      "externalId",
      "growthRating",
      "id",
      "keyConcepts",
      "name",
      "patentRating",
      "position",
      "rankedRelatedClusters",
      "topCompanies",
      "topInstitutions",
      "topJournals",
    ]);
  });

  it("should rank related clusters and name each one, with no id for a cluster we do not hold", async () => {
    const atlas = buildAtlas({
      clusterAttributes: {
        findByExternalIds: vi
          .fn()
          .mockResolvedValue([
            buildRelated(7, "Optics"),
            buildRelated(8, null),
          ]),
      },
    });

    const result = await callerFor("en_US", atlas).cluster.byId({ id: "c-1" });

    /* 8 sorts first because topCiting and topCited add up to 32. */
    expect(result?.rankedRelatedClusters).toEqual([
      { externalId: 8, id: "c-8", displayName: "Cluster #8" },
      { externalId: 7, id: "c-7", displayName: "Optics" },
      { externalId: 9, id: null, displayName: "Cluster #9" },
    ]);
  });

  it("should look nothing up when the cluster has no citation links", async () => {
    const findByExternalIds = vi.fn().mockResolvedValue([]);
    const atlas = buildAtlas({
      clusters: {
        findById: vi.fn().mockResolvedValue({
          ...buildCluster(),
          relatedClusters: { topCiting: [], topCited: [] },
        }),
      },
      clusterAttributes: { findByExternalIds },
    });

    const result = await callerFor("en_US", atlas).cluster.byId({ id: "c-1" });

    expect(result?.rankedRelatedClusters).toEqual([]);
    expect(findByExternalIds).not.toHaveBeenCalled();
  });
});

describe("cluster.viewport", () => {
  const bbox = { x: { min: 0, max: 10 }, y: { min: 1, max: 10 } };

  it("should return the map attributes and nothing else", async () => {
    const result = await callerFor("pl_PL").cluster.viewport({ bbox });

    expect(result[0]).toEqual({
      id: "c-1",
      externalId: 1,
      position: { x: 10, y: 5 },
      displayName: "Uczenie Maszynowe",
      articlesCount: 1200,
      growthRating: 75.5,
      keyConcepts: ["machine learning", "neural networks"],
    });
  });

  it("should flip bbox y from screen-space to natural before querying store", async () => {
    const findInViewport = vi.fn().mockResolvedValue([]);
    const atlas = buildAtlas({ clusterAttributes: { findInViewport } });
    const screenBbox = { x: { min: 0, max: 10 }, y: { min: 2, max: 8 } };

    await callerFor("en_US", atlas).cluster.viewport({ bbox: screenBbox });

    expect(findInViewport).toHaveBeenCalledTimes(1);
    expect(findInViewport).toHaveBeenNthCalledWith(1, {
      bbox: { x: { min: 0, max: 10 }, y: { min: -8, max: -2 } },
      limit: 500,
    });
  });

  it("should forward a caller-provided limit", async () => {
    const findInViewport = vi.fn().mockResolvedValue([]);
    const atlas = buildAtlas({ clusterAttributes: { findInViewport } });

    await callerFor("en_US", atlas).cluster.viewport({ bbox, limit: 25 });

    expect(findInViewport).toHaveBeenNthCalledWith(1, {
      bbox: { x: { min: 0, max: 10 }, y: { min: -10, max: -1 } },
      limit: 25,
    });
  });
});
