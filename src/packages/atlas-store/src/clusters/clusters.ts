import type { QdrantClient } from "@qdrant/js-client-rest";
import { v5 as uuidv5 } from "uuid";
import { z } from "zod";
import {
  type BBox,
  type Cluster,
  type ClusterInput,
  type ClusterMatch,
  type ClusterRepository,
  clusterAssociationsSchema,
  clusterAttributesSchema,
  clusterSchema,
} from "@map-of-science/atlas";
import {
  CLUSTER_ASSOCIATIONS_COLLECTION,
  CLUSTERS_COLLECTION,
} from "../collection/collections.js";
import { createCollectionSchema } from "../collection/create-collection-schema.js";

const TITLES_VECTOR = "titles";
const TITLES_VECTOR_SIZE = 768;

const POINT_ID_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

const pointId = (externalId: number) =>
  uuidv5(String(externalId), POINT_ID_NAMESPACE);

const attributesSchemaSpec = {
  name: CLUSTERS_COLLECTION,
  vectors: {
    [TITLES_VECTOR]: { size: TITLES_VECTOR_SIZE, distance: "Cosine" },
  },
  payloadIndexes: [
    { field_name: "x", field_schema: "float" },
    { field_name: "y", field_schema: "float" },
    { field_name: "articlesCount", field_schema: "integer" },
  ],
} as const;

const associationsSchemaSpec = {
  name: CLUSTER_ASSOCIATIONS_COLLECTION,
  vectors: {},
  payloadIndexes: [],
} as const;

const rawPointSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  payload: z.record(z.string(), z.unknown()),
});

const rawScoredPointSchema = rawPointSchema.extend({
  score: z.number(),
});

const toRelatedPayload = (
  related: ClusterInput["relatedClusters"]["topCiting"],
) =>
  related.map((entry) => ({
    id: entry.externalId,
    significantCitations: entry.significantCitations,
  }));

const toAttributesPayload = (cluster: ClusterInput) => {
  const { position, citationRating, patentRating, ...attributes } =
    clusterAttributesSchema.parse(cluster);
  return {
    ...attributes,
    x: position.x,
    y: position.y,
    citationRatingPercentile: citationRating,
    patentRatingPercentile: patentRating,
  };
};

const toAssociationsPayload = (cluster: ClusterInput) => {
  const { relatedClusters, ...associations } =
    clusterAssociationsSchema.parse(cluster);
  return {
    ...associations,
    relatedClusters: {
      topCiting: toRelatedPayload(relatedClusters.topCiting),
      topCited: toRelatedPayload(relatedClusters.topCited),
    },
  };
};

const storedRelatedSchema = z
  .array(z.object({ id: z.number(), significantCitations: z.number() }))
  .transform((entries) =>
    entries.map(({ id, significantCitations }) => ({
      externalId: id,
      significantCitations,
    })),
  );

const storedRelatedClustersSchema = z.object({
  topCiting: storedRelatedSchema,
  topCited: storedRelatedSchema,
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
    averageArticleAgeYears: payload.averageArticleAgeYears,
    citationRating: payload.citationRatingPercentile,
    patentRating: payload.patentRatingPercentile,
    topJournals: payload.topJournals,
    topInstitutions: payload.topInstitutions,
    topCompanies: payload.topCompanies,
    articles: payload.articles,
    relatedClusters: storedRelatedClustersSchema.parse(payload.relatedClusters),
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
}) =>
  ({
    async createSchema() {
      await createCollectionSchema(qdrant, attributesSchemaSpec);
      await createCollectionSchema(qdrant, associationsSchemaSpec);
    },

    async upsert(items: ClusterInput[]) {
      if (items.length === 0) return;
      const points = items.map((item) => ({
        id: pointId(item.externalId),
        vector: item.vector,
        attributes: toAttributesPayload(item),
        associations: toAssociationsPayload(item),
      }));

      await Promise.all([
        qdrant.upsert(CLUSTERS_COLLECTION, {
          wait: true,
          points: points.map(({ id, vector, attributes }) => ({
            id,
            vector: { [TITLES_VECTOR]: vector },
            payload: attributes,
          })),
        }),
        qdrant.upsert(CLUSTER_ASSOCIATIONS_COLLECTION, {
          wait: true,
          /* A vectorless collection still rejects a point with no `vector` field. */
          points: points.map(({ id, associations }) => ({
            id,
            vector: {},
            payload: associations,
          })),
        }),
      ]);
    },

    async findById(id: string): Promise<Cluster | null> {
      const result = await qdrant.retrieve(CLUSTERS_COLLECTION, {
        ids: [id],
        with_payload: true,
        with_vector: false,
      });
      if (result.length === 0) return null;
      return parsePoint(result[0]);
    },

    async findByIds(ids: string[]): Promise<Cluster[]> {
      if (ids.length === 0) return [];
      const result = await qdrant.retrieve(CLUSTERS_COLLECTION, {
        ids,
        with_payload: true,
        with_vector: false,
      });
      return result.map(parsePoint);
    },

    async findByExternalIds(externalIds: number[]): Promise<Cluster[]> {
      if (externalIds.length === 0) return [];
      const result = await qdrant.retrieve(CLUSTERS_COLLECTION, {
        ids: externalIds.map(pointId),
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
      const response = await qdrant.scroll(CLUSTERS_COLLECTION, {
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
      minScore,
    }: {
      vector: number[];
      limit: number;
      minScore: number;
    }): Promise<ClusterMatch[]> {
      const response = await qdrant.query(CLUSTERS_COLLECTION, {
        query: vector,
        using: TITLES_VECTOR,
        limit,
        score_threshold: minScore,
        with_payload: true,
        with_vector: false,
      });
      return response.points.map(parseScoredPoint);
    },
  }) satisfies ClusterRepository;
