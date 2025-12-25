import { QdrantClient } from "@qdrant/js-client-rest";
import { randomUUID } from "node:crypto";
import { v5 as uuidv5 } from "uuid";
import { z } from "zod";
import { buildFilter } from "./buildFilter.js";

const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

const toPointId = (id: string) => uuidv5(id, NAMESPACE);

type UpsertParams = {
  id?: string;
  vectors: Record<string, number[]>;
  metadata?: Record<string, unknown>;
};

type UpsertResult = {
  id: string;
};

const upsertParamsSchema = z.object({
  id: z.string().optional(),
  vectors: z.record(z.string(), z.array(z.number())),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type MatchFilter = {
  key: string;
  match: string | number | boolean;
};

type VectorSearchParams = {
  using: string;
  vector: number[];
  filter?: MatchFilter[];
  limit?: number;
  offset?: number;
  scoreThreshold?: number;
};

type OrderBy = {
  key: string;
  direction: "asc" | "desc";
};

type FilterOnlySearchParams = {
  vector?: never;
  filter: MatchFilter[];
  limit?: number;
  offset?: string;
  orderBy?: OrderBy;
};

type SearchParams = VectorSearchParams | FilterOnlySearchParams;

const metadataSchema = z.record(z.string(), z.unknown()).optional();

const searchResultSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  score: z.number(),
  payload: metadataSchema,
});

const pointSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  vector: z.record(z.string(), z.array(z.number())),
  payload: metadataSchema,
});

type SearchResult = {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
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
 * - `weightedSum`: Calculates final score as: weight[0] * score[0] + weight[1] * score[1].
 *   Use when you know the relative importance of each vector.
 */
export type FusionStrategy =
  | { type: "rrf"; k?: number }
  | { type: "dbsf" }
  | { type: "weightedSum"; weights: [number, number] };

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
 * Parameters for hybrid search that combines results from multiple vector searches.
 */
export type HybridSearchParams = {
  prefetch: [PrefetchQuery, PrefetchQuery];
  fusion: FusionStrategy;
  filter?: MatchFilter[];
  limit?: number;
  scoreThreshold?: number;
};

type PaginatedSearchResult = {
  items: SearchResult[];
  nextOffset: number | string | null;
};

type GetResult = {
  id: string;
  vectors: Record<string, number[]>;
  metadata?: Record<string, unknown>;
};

export interface VectorStore {
  upsert(params: UpsertParams): Promise<UpsertResult>;
  search(params: SearchParams): Promise<PaginatedSearchResult>;
  get(id: string): Promise<GetResult | null>;
  delete(id: string): Promise<void>;
  updateMetadata(id: string, metadata: Record<string, unknown>): Promise<void>;
}

type Params = {
  url: string;
  apiKey?: string;
  collectionName: string;
  vectors: Record<string, { size: number }>;
  payloadIndexes?: {
    field: string;
    type: "keyword" | "integer" | "float" | "bool" | "text";
  }[];
};

export const createQdrantStore = (params: Params) => {
  const client = new QdrantClient({
    url: params.url,
    ...(params.apiKey && { apiKey: params.apiKey }),
  });

  let ensureCollectionPromise: Promise<void> | null = null;

  const ensureCollection = () => {
    if (ensureCollectionPromise) return ensureCollectionPromise;

    ensureCollectionPromise = (async () => {
      const { exists } = await client.collectionExists(params.collectionName);
      if (!exists) {
        const vectorsConfig = Object.fromEntries(
          Object.entries(params.vectors).map(([name, { size }]) => [
            name,
            { size, distance: "Cosine" as const },
          ]),
        );
        await client.createCollection(params.collectionName, {
          vectors: vectorsConfig,
        });

        if (params.payloadIndexes?.length) {
          await Promise.all(
            params.payloadIndexes.map((index) =>
              client.createPayloadIndex(params.collectionName, {
                field_name: index.field,
                field_schema: index.type,
              }),
            ),
          );
        }
      }
    })();

    return ensureCollectionPromise;
  };

  const scrollSearch = async (
    searchParams: FilterOnlySearchParams,
    qdrantFilter: ReturnType<typeof buildFilter> | undefined,
    limit: number,
  ): Promise<PaginatedSearchResult> => {
    const { orderBy } = searchParams;
    const fetchLimit = limit + 1;
    const scrollLimit = orderBy ? fetchLimit : limit;

    const getStartFrom = () => {
      if (!orderBy || !searchParams.offset) return undefined;
      const value = Number(searchParams.offset);
      return orderBy.direction === "desc" ? value - 1 : value + 1;
    };

    const response = await client.scroll(params.collectionName, {
      filter: qdrantFilter,
      limit: scrollLimit,
      offset: orderBy ? undefined : searchParams.offset,
      with_payload: true,
      with_vector: false,
      order_by: orderBy
        ? {
            key: orderBy.key,
            direction: orderBy.direction,
            start_from: getStartFrom(),
          }
        : undefined,
    });

    const allItems = response.points.map((point) => ({
      id: String(point.id),
      score: 1,
      metadata: point.payload as Record<string, unknown> | undefined,
    }));

    if (orderBy) {
      const hasMore = allItems.length > limit;
      const items = hasMore ? allItems.slice(0, limit) : allItems;
      const lastItem = items[items.length - 1];
      return {
        items,
        nextOffset:
          hasMore && lastItem ? String(lastItem.metadata?.[orderBy.key]) : null,
      };
    }

    const nextPageOffset = response.next_page_offset;
    return {
      items: allItems,
      nextOffset:
        typeof nextPageOffset === "string" || typeof nextPageOffset === "number"
          ? String(nextPageOffset)
          : null,
    };
  };

  const vectorSearch = async (
    searchParams: VectorSearchParams,
    qdrantFilter: ReturnType<typeof buildFilter> | undefined,
    limit: number,
  ): Promise<PaginatedSearchResult> => {
    const { using, vector, offset = 0, scoreThreshold = 0.5 } = searchParams;
    const fetchLimit = limit + 1;

    const response = await client.search(params.collectionName, {
      vector: { name: using, vector },
      filter: qdrantFilter,
      limit: fetchLimit,
      offset,
      score_threshold: scoreThreshold,
      with_payload: true,
    });

    const items = response.map((item) => {
      const parsed = searchResultSchema.parse(item);
      return { id: parsed.id, score: parsed.score, metadata: parsed.payload };
    });

    const hasMore = items.length > limit;
    return {
      items: hasMore ? items.slice(0, limit) : items,
      nextOffset: hasMore ? offset + limit : null,
    };
  };

  return {
    async upsert(upsertParams: UpsertParams) {
      const {
        id: providedId,
        vectors,
        metadata,
      } = upsertParamsSchema.parse(upsertParams);
      const id = providedId ?? randomUUID();
      const pointId = providedId ? toPointId(providedId) : id;
      await ensureCollection();
      await client.upsert(params.collectionName, {
        points: [{ id: pointId, vector: vectors, payload: metadata }],
      });
      return { id };
    },

    async search(searchParams: SearchParams): Promise<PaginatedSearchResult> {
      await ensureCollection();
      const { filter, limit = 100 } = searchParams;
      const qdrantFilter = filter?.length ? buildFilter(filter) : undefined;

      // TODO: make sure to use composition pattern when adding features to the
      // search function or even compose search of multiple search strategy
      // implementations
      if (searchParams.vector) {
        return vectorSearch(searchParams, qdrantFilter, limit);
      }
      return scrollSearch(searchParams, qdrantFilter, limit);
    },

    async get(id: string) {
      const pointId = toPointId(id);
      const response = await client.retrieve(params.collectionName, {
        ids: [pointId],
        with_payload: true,
        with_vector: true,
      });
      if (response.length === 0) return null;
      const parsed = pointSchema.parse(response[0]);
      return {
        id,
        vectors: parsed.vector,
        metadata: parsed.payload,
      };
    },

    async delete(id: string) {
      const pointId = toPointId(id);
      await client.delete(params.collectionName, {
        points: [pointId],
      });
    },

    async updateMetadata(id: string, metadata: Record<string, unknown>) {
      const pointId = toPointId(id);
      await client.overwritePayload(params.collectionName, {
        points: [pointId],
        payload: metadata,
      });
    },

    async hybridSearch(
      searchParams: HybridSearchParams,
    ): Promise<SearchResult[]> {
      await ensureCollection();

      const {
        prefetch,
        fusion,
        filter,
        limit = 10,
        scoreThreshold,
      } = searchParams;
      const qdrantFilter = filter?.length ? buildFilter(filter) : undefined;

      const prefetchRequests = prefetch.map((p) => ({
        query: p.vector,
        using: p.using,
        limit: p.limit,
        score_threshold: p.scoreThreshold,
      }));

      const buildFusionQuery = () => {
        switch (fusion.type) {
          case "rrf":
            return { fusion: "rrf" as const };
          case "dbsf":
            return { fusion: "dbsf" as const };
          case "weightedSum":
            return {
              formula: {
                sum: [
                  { mult: [fusion.weights[0], "$score[0]"] },
                  { mult: [fusion.weights[1], "$score[1]"] },
                ],
              },
            };
        }
      };

      const response = await client.query(params.collectionName, {
        prefetch: prefetchRequests,
        query: buildFusionQuery(),
        limit,
        score_threshold: scoreThreshold,
        filter: qdrantFilter,
        with_payload: true,
      });

      return response.points.map((item) => {
        const parsed = searchResultSchema.parse(item);
        return { id: parsed.id, score: parsed.score, metadata: parsed.payload };
      });
    },
  };
};
