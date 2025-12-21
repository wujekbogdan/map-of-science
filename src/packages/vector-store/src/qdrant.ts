import { QdrantClient } from "@qdrant/js-client-rest";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { buildFilter } from "./buildFilter.js";

type UpsertParams = {
  id?: string;
  vector: number[];
  metadata?: Record<string, unknown>;
};

type UpsertResult = {
  id: string;
};

const upsertParamsSchema = z.object({
  id: z.string().optional(),
  vector: z.array(z.number()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type MatchFilter = {
  key: string;
  match: string | number | boolean;
};

type VectorSearchParams = {
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
  vector: z.array(z.number()),
  payload: metadataSchema,
});

type SearchResult = {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
};

type PaginatedSearchResult = {
  items: SearchResult[];
  nextOffset: number | string | null;
};

type GetResult = {
  id: string;
  vector: number[];
  metadata?: Record<string, unknown>;
};

export interface VectorStore {
  upsert(params: UpsertParams): Promise<UpsertResult>;
  search(params: SearchParams): Promise<PaginatedSearchResult>;
  get(id: string): Promise<GetResult | null>;
  delete(id: string): Promise<void>;
  updateMetadata(id: string, metadata: Record<string, unknown>): Promise<void>;
}

type PayloadIndexType = "keyword" | "integer" | "float" | "bool" | "text";

type PayloadIndex = {
  field: string;
  type: PayloadIndexType;
};

type Params = {
  url: string;
  apiKey?: string;
  collectionName: string;
  vectorSize: number;
  payloadIndexes?: PayloadIndex[];
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
        await client.createCollection(params.collectionName, {
          vectors: { size: params.vectorSize, distance: "Cosine" },
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
    const { vector, offset = 0, scoreThreshold = 0.5 } = searchParams;
    const fetchLimit = limit + 1;

    const response = await client.search(params.collectionName, {
      vector,
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
        vector,
        metadata,
      } = upsertParamsSchema.parse(upsertParams);
      const id = providedId ?? randomUUID();
      await ensureCollection();
      await client.upsert(params.collectionName, {
        points: [{ id, vector, payload: metadata }],
      });
      return { id };
    },

    async search(searchParams: SearchParams): Promise<PaginatedSearchResult> {
      await ensureCollection();
      const { filter, limit = 100 } = searchParams;
      const qdrantFilter = filter?.length ? buildFilter(filter) : undefined;

      if (searchParams.vector) {
        return vectorSearch(searchParams, qdrantFilter, limit);
      }
      return scrollSearch(searchParams, qdrantFilter, limit);
    },

    async get(id: string) {
      const response = await client.retrieve(params.collectionName, {
        ids: [id],
        with_payload: true,
        with_vector: true,
      });
      if (response.length === 0) return null;
      const parsed = pointSchema.parse(response[0]);
      return {
        id: parsed.id,
        vector: parsed.vector,
        metadata: parsed.payload,
      };
    },

    async delete(id: string) {
      await client.delete(params.collectionName, {
        points: [id],
      });
    },

    async updateMetadata(id: string, metadata: Record<string, unknown>) {
      await client.overwritePayload(params.collectionName, {
        points: [id],
        payload: metadata,
      });
    },
  };
};
