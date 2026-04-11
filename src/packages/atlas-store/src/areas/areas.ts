import type { QdrantClient } from "@qdrant/js-client-rest";
import { z } from "zod";
import { type Area, type BBox, areaSchema } from "@map-of-science/atlas";
import { createLogger } from "@map-of-science/logger";
import { ensureCollectionSchema } from "../collection/ensure-collection-schema.js";

const logger = createLogger();

const COLLECTION = "areas";
const PLACEHOLDER_VECTOR = "_placeholder";
const PLACEHOLDER_SIZE = 1;
const PLACEHOLDER_VALUE: number[] = [0];

// Defensive cap on viewport query results. A warning is logged if a query
// returns exactly this many rows so the cap can be raised before truncation
// becomes a real problem.
const VIEWPORT_LIMIT = 10_000;

const schemaSpec = {
  name: COLLECTION,
  vectors: {
    [PLACEHOLDER_VECTOR]: { size: PLACEHOLDER_SIZE, distance: "Cosine" },
  },
  payloadIndexes: [
    { field_name: "x", field_schema: "float" },
    { field_name: "y", field_schema: "float" },
    { field_name: "tier", field_schema: "integer" },
  ],
} as const;

const rawPointSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  payload: z.record(z.string(), z.unknown()),
});

const toPayload = (area: Area) => ({
  externalId: area.externalId,
  x: area.position.x,
  y: area.position.y,
  tier: area.tier,
  name: area.name,
});

const payloadToArea = (id: string, payload: Record<string, unknown>): Area =>
  areaSchema.parse({
    id,
    externalId: payload.externalId,
    position: { x: payload.x, y: payload.y },
    tier: payload.tier,
    name: payload.name,
  });

const parsePoint = (raw: unknown): Area => {
  const { id, payload } = rawPointSchema.parse(raw);
  return payloadToArea(id, payload);
};

export const createAreasRepository = ({
  qdrant,
}: {
  qdrant: QdrantClient;
}) => ({
  async ensureSchema() {
    await ensureCollectionSchema(qdrant, schemaSpec);
  },

  async upsert(items: Area[]) {
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

  async findById(id: string): Promise<Area | null> {
    const result = await qdrant.retrieve(COLLECTION, {
      ids: [id],
      with_payload: true,
      with_vector: false,
    });
    if (result.length === 0) return null;
    return parsePoint(result[0]);
  },

  async findInViewport({
    bbox,
    tier,
  }: {
    bbox: BBox;
    tier?: number;
  }): Promise<Area[]> {
    const must = [
      { key: "x", range: { gte: bbox.x.min, lte: bbox.x.max } },
      { key: "y", range: { gte: bbox.y.min, lte: bbox.y.max } },
      ...(tier !== undefined ? [{ key: "tier", match: { value: tier } }] : []),
    ];
    const response = await qdrant.scroll(COLLECTION, {
      filter: { must },
      limit: VIEWPORT_LIMIT,
      with_payload: true,
      with_vector: false,
    });
    const areas = response.points.map(parsePoint);
    if (areas.length === VIEWPORT_LIMIT) {
      logger.warn(
        { limit: VIEWPORT_LIMIT, bbox, tier },
        "areas.findInViewport hit the viewport cap; raise VIEWPORT_LIMIT",
      );
    }
    return areas;
  },
});
