import type { QdrantClient } from "@qdrant/js-client-rest";
import type { BBox, ClusterAttributesReader } from "@map-of-science/atlas";
import {
  CLUSTERS_COLLECTION,
  TITLES_VECTOR,
} from "../collection/collections.js";
import {
  LINK_PAYLOAD_KEYS,
  MAP_PAYLOAD_KEYS,
  pointId,
  toLinkAttributes,
  toMapAttributes,
  toMatch,
} from "./clusterPayload.js";

export const createClusterAttributesReader = ({
  qdrant,
}: {
  qdrant: QdrantClient;
}) =>
  ({
    async findByExternalIds(externalIds: number[]) {
      if (externalIds.length === 0) return [];
      const points = await qdrant.retrieve(CLUSTERS_COLLECTION, {
        ids: externalIds.map(pointId),
        with_payload: LINK_PAYLOAD_KEYS,
        with_vector: false,
      });
      return points.map(toLinkAttributes);
    },

    async findInViewport({ bbox, limit }: { bbox: BBox; limit: number }) {
      const response = await qdrant.scroll(CLUSTERS_COLLECTION, {
        filter: {
          must: [
            { key: "x", range: { gte: bbox.x.min, lte: bbox.x.max } },
            { key: "y", range: { gte: bbox.y.min, lte: bbox.y.max } },
          ],
        },
        limit,
        with_payload: MAP_PAYLOAD_KEYS,
        with_vector: false,
        order_by: { key: "articlesCount", direction: "desc" },
      });
      return response.points.map(toMapAttributes);
    },

    async findByVector({
      vector,
      limit,
      minScore,
    }: {
      vector: number[];
      limit: number;
      minScore: number;
    }) {
      const response = await qdrant.query(CLUSTERS_COLLECTION, {
        query: vector,
        using: TITLES_VECTOR,
        limit,
        score_threshold: minScore,
        with_payload: MAP_PAYLOAD_KEYS,
        with_vector: false,
      });
      return response.points.map(toMatch);
    },
  }) satisfies ClusterAttributesReader;
