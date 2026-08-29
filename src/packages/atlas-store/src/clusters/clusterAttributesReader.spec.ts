import type { QdrantClient } from "@qdrant/js-client-rest";
import { describe, expect, it, vi } from "vitest";
import { createClusterAttributesReader } from "./clusterAttributesReader.js";
import { LINK_PAYLOAD_KEYS, MAP_PAYLOAD_KEYS } from "./clusterPayload.js";

const buildQdrantMocks = () => ({
  retrieve: vi.fn().mockResolvedValue([]),
  scroll: vi.fn().mockResolvedValue({ points: [] }),
  query: vi.fn().mockResolvedValue({ points: [] }),
});

const asClient = (mocks: ReturnType<typeof buildQdrantMocks>) =>
  mocks as unknown as QdrantClient;

describe("createClusterAttributesReader", () => {
  describe("findInViewport", () => {
    it("should request the map payload keys inside the bounding box, widest cluster first", async () => {
      const mocks = buildQdrantMocks();
      const reader = createClusterAttributesReader({
        qdrant: asClient(mocks),
      });

      await reader.findInViewport({
        bbox: { x: { min: 0, max: 10 }, y: { min: -5, max: 5 } },
        limit: 500,
      });

      expect(mocks.scroll).toHaveBeenCalledTimes(1);
      expect(mocks.scroll).toHaveBeenNthCalledWith(1, "clusters", {
        filter: {
          must: [
            { key: "x", range: { gte: 0, lte: 10 } },
            { key: "y", range: { gte: -5, lte: 5 } },
          ],
        },
        limit: 500,
        with_payload: MAP_PAYLOAD_KEYS,
        with_vector: false,
        order_by: { key: "articlesCount", direction: "desc" },
      });
    });
  });

  describe("findByVector", () => {
    it("should request the map payload keys on the titles vector", async () => {
      const mocks = buildQdrantMocks();
      const reader = createClusterAttributesReader({
        qdrant: asClient(mocks),
      });

      await reader.findByVector({
        vector: [0.1, 0.2],
        limit: 10,
        minScore: 0.7,
      });

      expect(mocks.query).toHaveBeenCalledTimes(1);
      expect(mocks.query).toHaveBeenNthCalledWith(1, "clusters", {
        query: [0.1, 0.2],
        using: "titles",
        limit: 10,
        score_threshold: 0.7,
        with_payload: MAP_PAYLOAD_KEYS,
        with_vector: false,
      });
    });
  });

  describe("findByExternalIds", () => {
    it("should request the link payload keys at the points the external ids resolve to", async () => {
      const mocks = buildQdrantMocks();
      const reader = createClusterAttributesReader({
        qdrant: asClient(mocks),
      });

      await reader.findByExternalIds([42, 0]);

      expect(mocks.retrieve).toHaveBeenCalledTimes(1);
      expect(mocks.retrieve).toHaveBeenNthCalledWith(1, "clusters", {
        ids: [
          "7c411b5e-9d3f-50b5-9c28-62096e41c4ed",
          "6af613b6-569c-5c22-9c37-2ed93f31d3af",
        ],
        with_payload: LINK_PAYLOAD_KEYS,
        with_vector: false,
      });
    });

    it("should return an empty list without calling Qdrant when there are no external ids", async () => {
      const mocks = buildQdrantMocks();
      const reader = createClusterAttributesReader({
        qdrant: asClient(mocks),
      });

      const found = await reader.findByExternalIds([]);

      expect(found).toEqual([]);
      expect(mocks.retrieve).not.toHaveBeenCalled();
    });
  });
});
