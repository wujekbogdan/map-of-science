import { v5 as uuidv5 } from "uuid";
import { clusterInputSchema } from "@map-of-science/atlas";

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

const CLUSTER_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_SOURCE = "article-titles";

const resolveName = (lookups: ClusterLookups, externalId: string) => {
  const curated = lookups.curatedNames.get(externalId);
  if (curated) return { name: curated, nameSource: "curated" as const };
  const llm = lookups.llmNames.get(externalId);
  if (llm) return { name: llm, nameSource: "llm" as const };
  return { name: null, nameSource: null };
};

export const createBuildCluster =
  (lookups: ClusterLookups) =>
  ({ externalId, vector }: { externalId: string; vector: number[] }) => {
    const position = lookups.positions.get(externalId);
    if (!position) return null;

    const { name, nameSource } = resolveName(lookups, externalId);

    return clusterInputSchema.parse({
      id: uuidv5(externalId, CLUSTER_NAMESPACE),
      externalId: Number(externalId),
      position: { x: position.x, y: position.y },
      name,
      nameSource,
      articlesCount: position.articlesCount,
      growthRating: position.growthRating,
      embedding: { model: EMBEDDING_MODEL, source: EMBEDDING_SOURCE },
      vector,
    });
  };
