import { describe, expect, it } from "vitest";
import type { ClusterInput } from "@map-of-science/atlas";
import {
  LINK_PAYLOAD_KEYS,
  MAP_PAYLOAD_KEYS,
  toAssociationsPayload,
  toAttributesPayload,
  toCluster,
  toLinkAttributes,
  toMapAttributes,
} from "./clusterPayload.js";

const buildClusterInput = (
  overrides: Partial<ClusterInput> = {},
): ClusterInput => ({
  externalId: 1,
  position: { x: 12.5, y: -8.25 },
  name: { en_US: "Machine Learning", pl_PL: "Uczenie Maszynowe" },
  nameSource: "llm",
  articlesCount: 1200,
  growthRating: 73.4,
  embedding: { model: "gemini-embedding-001", source: "article-titles" },
  keyConcepts: ["edible coatings", "shelf life"],
  averageArticleAgeYears: 5.8,
  citationRating: 75.47,
  patentRating: 99.78,
  topJournals: ["Nature", "Science advances"],
  topInstitutions: ["Centre National de la Recherche Scientifique"],
  topCompanies: [],
  articles: {
    core: [
      {
        title: "Attention is all you need",
        metadata: "2017: Advances in neural information processing systems",
        citations: 120000,
        doi: "10.48550/arXiv.1706.03762",
      },
    ],
    review: [],
    highlyCited: [
      { title: "Deep learning", metadata: "2015", citations: 90000, doi: null },
    ],
  },
  relatedClusters: {
    topCiting: [{ externalId: 0, significantCitations: 35 }],
    topCited: [{ externalId: 7, significantCitations: 12 }],
  },
  vector: Array.from({ length: 768 }, () => 0),
  ...overrides,
});

describe("clusterPayload", () => {
  it("should read back the cluster it wrote", () => {
    const input = buildClusterInput();
    const id = "7c411b5e-9d3f-50b5-9c28-62096e41c4ed";

    const found = toCluster({
      id,
      attributes: toAttributesPayload(input),
      associations: toAssociationsPayload(input),
    });

    const { vector, ...cluster } = input;
    expect(vector).toHaveLength(768);
    expect(found).toEqual({ ...cluster, id });
  });

  it("should send each domain field to exactly one collection", () => {
    const input = buildClusterInput();

    expect(Object.keys(toAttributesPayload(input)).toSorted()).toEqual([
      "articlesCount",
      "averageArticleAgeYears",
      "citationRatingPercentile",
      "externalId",
      "growthRating",
      "keyConcepts",
      "name",
      "patentRatingPercentile",
      "x",
      "y",
    ]);
    expect(Object.keys(toAssociationsPayload(input)).toSorted()).toEqual([
      "articles",
      "embedding",
      "nameSource",
      "relatedClusters",
      "topCompanies",
      "topInstitutions",
      "topJournals",
    ]);
  });

  it("should ask Qdrant only for the keys the map attributes need", () => {
    expect(MAP_PAYLOAD_KEYS.toSorted()).toEqual([
      "articlesCount",
      "externalId",
      "growthRating",
      "keyConcepts",
      "name",
      "x",
      "y",
    ]);
  });

  it.each([
    [
      "the keys it asked for",
      {
        externalId: 1,
        x: 12.5,
        y: -8.25,
        name: { en_US: "Machine Learning", pl_PL: "Uczenie Maszynowe" },
        articlesCount: 1200,
        growthRating: 73.4,
        keyConcepts: ["edible coatings", "shelf life"],
      },
    ],
    ["more keys than it asked for", toAttributesPayload(buildClusterInput())],
  ])(
    "should answer with the map attributes and nothing else, given %s",
    (_, payload) => {
      const id = "7c411b5e-9d3f-50b5-9c28-62096e41c4ed";

      expect(toMapAttributes({ id, payload })).toEqual({
        id,
        externalId: 1,
        position: { x: 12.5, y: -8.25 },
        name: { en_US: "Machine Learning", pl_PL: "Uczenie Maszynowe" },
        articlesCount: 1200,
        growthRating: 73.4,
        keyConcepts: ["edible coatings", "shelf life"],
      });
    },
  );

  it("should answer with the link attributes and nothing else", () => {
    const id = "7c411b5e-9d3f-50b5-9c28-62096e41c4ed";

    expect(LINK_PAYLOAD_KEYS.toSorted()).toEqual(["externalId", "name"]);
    expect(
      toLinkAttributes({
        id,
        payload: toAttributesPayload(buildClusterInput()),
      }),
    ).toEqual({
      id,
      externalId: 1,
      name: { en_US: "Machine Learning", pl_PL: "Uczenie Maszynowe" },
    });
  });

  it("should read keyConcepts as empty when the stored point has none", () => {
    const { keyConcepts, ...payload } =
      toAttributesPayload(buildClusterInput());

    expect(keyConcepts).toHaveLength(2);
    expect(
      toMapAttributes({ id: "7c411b5e-9d3f-50b5-9c28-62096e41c4ed", payload }),
    ).toMatchObject({ keyConcepts: [] });
  });
});
