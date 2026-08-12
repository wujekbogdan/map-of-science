import { clusterInputSchema } from "@map-of-science/atlas";
import type { EtoRecord } from "../../../eto/record.js";

export type LocalizedName = { en_US: string; pl_PL: string };

export type PositionRow = {
  x: number;
  y: number;
  articlesCount: number;
  growthRating: number;
};

export type ClusterLookups = {
  positions: Map<string, PositionRow>;
  llmNames: Map<string, LocalizedName>;
  curatedNames: Map<string, LocalizedName>;
};

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_SOURCE = "article-titles";

const resolveName = (lookups: ClusterLookups, externalId: string) => {
  const curated = lookups.curatedNames.get(externalId);
  if (curated) return { name: curated, nameSource: "curated" as const };
  const llm = lookups.llmNames.get(externalId);
  if (llm) return { name: llm, nameSource: "llm" as const };
  return { name: null, nameSource: null };
};

const toRelatedClusters = (
  entries: EtoRecord["relatedClusters"]["topCiting"],
) =>
  entries.map(({ id, significantCitations }) => ({
    externalId: id,
    significantCitations,
  }));

export const createBuildCluster =
  (lookups: ClusterLookups) =>
  ({ record, vector }: { record: EtoRecord; vector: number[] }) => {
    const externalId = String(record.id);
    const position = lookups.positions.get(externalId);
    if (!position) return null;

    const { name, nameSource } = resolveName(lookups, externalId);

    return clusterInputSchema.parse({
      externalId: record.id,
      position: { x: position.x, y: position.y },
      name,
      nameSource,
      articlesCount: position.articlesCount,
      growthRating: position.growthRating,
      embedding: { model: EMBEDDING_MODEL, source: EMBEDDING_SOURCE },
      averageArticleAgeYears: record.averageArticleAgeYears,
      citationRating: record.citationRatingPercentile,
      patentRating: record.patentRatingPercentile,
      topJournals: record.topJournals,
      topInstitutions: record.topInstitutions,
      topCompanies: record.topCompanies,
      articles: record.articles,
      relatedClusters: {
        topCiting: toRelatedClusters(record.relatedClusters.topCiting),
        topCited: toRelatedClusters(record.relatedClusters.topCited),
      },
      vector,
    });
  };
