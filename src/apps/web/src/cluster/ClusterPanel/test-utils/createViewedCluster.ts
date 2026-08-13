import type { ViewedCluster } from "../../useViewedCluster.ts";

const article = {
  title: "Strategies toward High-Loading Lithium-Sulfur Battery",
  metadata: "2020: Advanced Energy Materials",
  citations: 556,
  doi: "10.1002/aenm.201903937",
};

/** A cluster as `cluster.byId` returns it. Override only the fields a spec is about. */
export const createViewedCluster = (
  overrides: Partial<ViewedCluster> = {},
): ViewedCluster => ({
  id: "abc-123",
  externalId: 1085,
  name: "Lithium-sulfur batteries",
  displayName: "Lithium-sulfur batteries",
  nameSource: "curated",
  position: { x: 1, y: 2 },
  articlesCount: 6701,
  keyConcepts: ["sulfur batteries", "high sulfur loading"],
  averageArticleAgeYears: 5.84,
  growthRating: 65.6,
  citationRating: 75.47,
  patentRating: 99.78,
  embedding: { model: "test-model", source: "test-source" },
  topJournals: ["Chemical Engineering Journal", "Small"],
  topInstitutions: ["Chinese Academy of Sciences – China"],
  topCompanies: ["Samsung (South Korea)"],
  articles: { core: [article], review: [], highlyCited: [article] },
  relatedClusters: { topCiting: [], topCited: [] },
  rankedRelatedClusters: [
    {
      externalId: 13708,
      significantCitations: 40,
      displayName: "Electrolytes and interfaces in lithium metal batteries",
      id: "def-456",
    },
  ],
  ...overrides,
});
