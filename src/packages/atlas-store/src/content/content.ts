import type { QdrantClient } from "@qdrant/js-client-rest";
import { z } from "zod";
import { type ContentItem, contentItemSchema } from "@map-of-science/atlas";
import { createLogger } from "@map-of-science/logger";
import { CONTENT_COLLECTION as COLLECTION } from "../collection/collections.js";
import { ensureCollectionSchema } from "../collection/ensure-collection-schema.js";

const logger = createLogger();
const PLACEHOLDER_VECTOR = "_placeholder";
const PLACEHOLDER_SIZE = 1;
const PLACEHOLDER_VALUE: number[] = [0];

// Defensive cap on content query results. A warning is logged if a query
// returns exactly this many rows so the cap can be raised before truncation
// becomes a real problem.
const FIND_BY_CLUSTER_LIMIT = 10_000;

const schemaSpec = {
  name: COLLECTION,
  vectors: {
    [PLACEHOLDER_VECTOR]: { size: PLACEHOLDER_SIZE, distance: "Cosine" },
  },
  payloadIndexes: [
    { field_name: "cluster_ids", field_schema: "keyword" },
    { field_name: "type", field_schema: "keyword" },
  ],
} as const;

const rawPointSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  payload: z.record(z.string(), z.unknown()),
});

const clusterIdsOf = (item: ContentItem) =>
  item.entityRefs.filter((ref) => ref.type === "cluster").map((ref) => ref.id);

const toPayload = (item: ContentItem) => ({
  type: item.type,
  title: item.title,
  url: item.url,
  metadata: item.metadata,
  entityRefs: item.entityRefs,
  cluster_ids: clusterIdsOf(item),
});

const payloadToContentItem = (
  id: string,
  payload: Record<string, unknown>,
): ContentItem =>
  contentItemSchema.parse({
    id,
    type: payload.type,
    title: payload.title,
    url: payload.url,
    metadata: payload.metadata,
    entityRefs: payload.entityRefs,
  });

const parsePoint = (raw: unknown): ContentItem => {
  const { id, payload } = rawPointSchema.parse(raw);
  return payloadToContentItem(id, payload);
};

export const createContentRepository = ({
  qdrant,
}: {
  qdrant: QdrantClient;
}) => ({
  async ensureSchema() {
    await ensureCollectionSchema(qdrant, schemaSpec);
  },

  async upsert(items: ContentItem[]) {
    if (items.length === 0) return;
    await qdrant.upsert(COLLECTION, {
      wait: true,
      points: items.map((item) => ({
        id: item.id,
        vector: { [PLACEHOLDER_VECTOR]: PLACEHOLDER_VALUE },
        payload: toPayload(item),
      })),
    });
  },

  async findByClusterId(clusterId: string): Promise<ContentItem[]> {
    const response = await qdrant.scroll(COLLECTION, {
      filter: {
        must: [{ key: "cluster_ids", match: { value: clusterId } }],
      },
      limit: FIND_BY_CLUSTER_LIMIT,
      with_payload: true,
      with_vector: false,
    });
    const items = response.points.map(parsePoint);
    if (items.length === FIND_BY_CLUSTER_LIMIT) {
      logger.warn(
        { limit: FIND_BY_CLUSTER_LIMIT, clusterId },
        "content.findByClusterId hit the query cap; raise FIND_BY_CLUSTER_LIMIT",
      );
    }
    return items;
  },
});
