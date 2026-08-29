import type { QdrantClient } from "@qdrant/js-client-rest";
import type {
  Cluster,
  ClusterInput,
  ClusterRepository,
} from "@map-of-science/atlas";
import { createLogger } from "@map-of-science/logger";
import {
  CLUSTER_ASSOCIATIONS_COLLECTION,
  CLUSTERS_COLLECTION,
  TITLES_VECTOR,
  TITLES_VECTOR_SIZE,
} from "../collection/collections.js";
import { createCollectionSchema } from "../collection/create-collection-schema.js";
import {
  pointId,
  toAssociationsPayload,
  toAttributesPayload,
  toCluster,
} from "./clusterPayload.js";

const logger = createLogger();

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
      const args = { ids: [id], with_payload: true, with_vector: false };
      const [attributePoints, associationPoints] = await Promise.all([
        qdrant.retrieve(CLUSTERS_COLLECTION, args),
        qdrant.retrieve(CLUSTER_ASSOCIATIONS_COLLECTION, args),
      ]);

      const attributes = attributePoints[0]?.payload;
      const associations = associationPoints[0]?.payload;
      if (!attributes && !associations) return null;
      if (!attributes || !associations) {
        logger.error({ id }, "cluster has a record in only one collection");
        return null;
      }

      return toCluster({ id, attributes, associations });
    },
  }) satisfies ClusterRepository;
