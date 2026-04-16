import type { QdrantClient } from "@qdrant/js-client-rest";
import { z } from "zod";
import {
  type BBox,
  type Cluster,
  type ClusterInput,
  type ClusterMatch,
  clusterSchema,
} from "@map-of-science/atlas";
import { CLUSTERS_COLLECTION as COLLECTION } from "../collection/collections.js";
import { createCollectionSchema } from "../collection/create-collection-schema.js";

const TITLES_VECTOR = "titles";
const TITLES_VECTOR_SIZE = 768;

const schemaSpec = {
  name: COLLECTION,
  vectors: {
    [TITLES_VECTOR]: { size: TITLES_VECTOR_SIZE, distance: "Cosine" },
  },
  payloadIndexes: [
    { field_name: "x", field_schema: "float" },
    { field_name: "y", field_schema: "float" },
    { field_name: "articlesCount", field_schema: "integer" },
    { field_name: "growthRating", field_schema: "float" },
  ],
} as const;

const rawPointSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  payload: z.record(z.string(), z.unknown()),
});

const rawScoredPointSchema = rawPointSchema.extend({
  score: z.number(),
});

const toPayload = (cluster: ClusterInput) => ({
  externalId: cluster.externalId,
  x: cluster.position.x,
  y: cluster.position.y,
  name: cluster.name,
  nameSource: cluster.nameSource,
  articlesCount: cluster.articlesCount,
  growthRating: cluster.growthRating,
  embedding: cluster.embedding,
  keyConcepts: cluster.keyConcepts,
});

const payloadToCluster = (
  id: string,
  payload: Record<string, unknown>,
): Cluster =>
  clusterSchema.parse({
    id,
    externalId: payload.externalId,
    position: { x: payload.x, y: payload.y },
    name: payload.name,
    nameSource: payload.nameSource,
    articlesCount: payload.articlesCount,
    growthRating: payload.growthRating,
    embedding: payload.embedding,
    keyConcepts: payload.keyConcepts ?? [],
  });

const parsePoint = (raw: unknown): Cluster => {
  const { id, payload } = rawPointSchema.parse(raw);
  return payloadToCluster(id, payload);
};

const parseScoredPoint = (raw: unknown): ClusterMatch => {
  const { id, payload, score } = rawScoredPointSchema.parse(raw);
  return { ...payloadToCluster(id, payload), score };
};

export const createClustersRepository = ({
  qdrant,
}: {
  qdrant: QdrantClient;
}) => ({
  async createSchema() {
    await createCollectionSchema(qdrant, schemaSpec);
  },

  async upsert(items: ClusterInput[]) {
    if (items.length === 0) return;
    await qdrant.upsert(COLLECTION, {
      wait: true,
      points: items.map((item) => ({
        id: item.id,
        vector: { [TITLES_VECTOR]: item.vector },
        payload: toPayload(item),
      })),
    });
  },

  async findById(id: string): Promise<Cluster | null> {
    const result = await qdrant.retrieve(COLLECTION, {
      ids: [id],
      with_payload: true,
      with_vector: false,
    });
    if (result.length === 0) return null;
    return parsePoint(result[0]);
  },

  async findByIds(ids: string[]): Promise<Cluster[]> {
    if (ids.length === 0) return [];
    const result = await qdrant.retrieve(COLLECTION, {
      ids,
      with_payload: true,
      with_vector: false,
    });
    return result.map(parsePoint);
  },

  async findInViewport({
    bbox,
    limit,
  }: {
    bbox: BBox;
    limit: number;
  }): Promise<Cluster[]> {
    const response = await qdrant.scroll(COLLECTION, {
      filter: {
        must: [
          { key: "x", range: { gte: bbox.x.min, lte: bbox.x.max } },
          { key: "y", range: { gte: bbox.y.min, lte: bbox.y.max } },
        ],
      },
      limit,
      with_payload: true,
      with_vector: false,
      order_by: { key: "articlesCount", direction: "desc" },
    });
    return response.points.map(parsePoint);
  },

  async findByVector({
    vector,
    limit,
  }: {
    vector: number[];
    limit: number;
  }): Promise<ClusterMatch[]> {
    const response = await qdrant.query(COLLECTION, {
      query: vector,
      using: TITLES_VECTOR,
      limit,
      with_payload: true,
      with_vector: false,
    });
    return response.points.map(parseScoredPoint);
  },
});
