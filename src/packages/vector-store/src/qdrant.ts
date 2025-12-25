import { QdrantClient } from "@qdrant/js-client-rest";
import { randomUUID } from "node:crypto";
import { v5 as uuidv5 } from "uuid";
import { z } from "zod";
import { createSearch } from "./search/createSearch.js";
import type { PaginatedSearchResult, SearchParams } from "./search/types.js";

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

const metadataSchema = z.record(z.string(), z.unknown()).optional();

const pointSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  vector: z.record(z.string(), z.array(z.number())),
  payload: metadataSchema,
});

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
      const search = createSearch({
        client,
        collectionName: params.collectionName,
      });
      return search(searchParams);
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
  };
};
