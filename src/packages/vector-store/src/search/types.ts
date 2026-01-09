import type { QdrantClient } from "@qdrant/js-client-rest";
import { z } from "zod";

export type MatchFilter = {
  key: string;
  match: string | number | boolean;
};

export type SearchResult = {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
};

export type PaginatedSearchResult = {
  items: SearchResult[];
  nextOffset: number | string | null;
};

type OrderBy = {
  key: string;
  direction: "asc" | "desc";
};

/**
 * Fusion strategy for combining results from multiple vector searches.
 *
 * - `rrf`: Reciprocal Rank Fusion - combines results based on their position/rank,
 *   ignoring actual similarity scores. Results appearing in multiple lists get boosted.
 *   The `k` parameter controls how much weight is given to position (higher k = positions matter less).
 *
 * - `dbsf`: Distribution-Based Score Fusion - normalizes similarity scores from each
 *   vector search and then sums them. Good when scores are meaningful and comparable.
 *
 * - `weightedSum`: Calculates final score as weighted sum of individual scores.
 *   Supports 2-3 vectors. Use when you know the relative importance of each vector.
 */
export type FusionStrategy =
  | { type: "rrf"; k?: number }
  | { type: "dbsf" }
  | {
      type: "weightedSum";
      weights: [number, number] | [number, number, number];
    };

/**
 * A prefetch query runs a vector search and collects candidates for fusion.
 * The limit should be larger than the final query limit (e.g., 10x-100x) to ensure
 * enough candidates are available for accurate fusion.
 */
export type PrefetchQuery = {
  vector: number[];
  using: string;
  limit: number;
  scoreThreshold?: number;
};

/**
 * Single vector search - finds items similar to one query vector.
 */
export type SingleVectorQuery = {
  type: "single";
  using: string;
  vector: number[];
  scoreThreshold?: number;
};

/**
 * Multi-vector fusion search - combines results from multiple vector searches.
 *
 * **Pagination constraint**: Each prefetch `limit` must be >= main query's `limit + offset`
 * to ensure enough candidates are available for accurate fusion at any page.
 */
export type MultiVectorQuery = {
  type: "multi";
  prefetch:
    | [PrefetchQuery, PrefetchQuery]
    | [PrefetchQuery, PrefetchQuery, PrefetchQuery];
  fusion: FusionStrategy;
  scoreThreshold?: number;
};

export type SearchQuery = SingleVectorQuery | MultiVectorQuery;

type VectorSearchParams = {
  query: SearchQuery;
  filter?: MatchFilter[];
  limit?: number;
  offset?: number;
};

type MetadataSearchParams = {
  query?: never;
  filter: MatchFilter[];
  limit?: number;
  offset?: string;
  orderBy?: OrderBy;
};

export type SearchParams = VectorSearchParams | MetadataSearchParams;

export type SearchDependencies = {
  client: QdrantClient;
  collectionName: string;
};

export const metadataSchema = z.record(z.string(), z.unknown()).optional();

export const pointSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  payload: metadataSchema,
});

export const searchResultSchema = pointSchema.extend({
  score: z.number(),
});
