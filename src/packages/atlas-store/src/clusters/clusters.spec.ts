import type { QdrantClient } from "@qdrant/js-client-rest";
import { describe, expect, it, vi } from "vitest";
import { createClustersRepository } from "./clusters.js";

const buildQdrantMocks = () => ({
  upsert: vi.fn().mockResolvedValue({}),
  retrieve: vi.fn().mockResolvedValue([]),
  scroll: vi.fn().mockResolvedValue({ points: [] }),
  query: vi.fn().mockResolvedValue({ points: [] }),
});

const asClient = (mocks: ReturnType<typeof buildQdrantMocks>) =>
  mocks as unknown as QdrantClient;

describe("createClustersRepository", () => {
  describe("findByVector", () => {
    it("should query the titles vector with limit and score_threshold", async () => {
      const mocks = buildQdrantMocks();
      const repository = createClustersRepository({ qdrant: asClient(mocks) });

      await repository.findByVector({
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
        with_payload: true,
        with_vector: false,
      });
    });
  });

  describe("findByIds", () => {
    it("should return an empty array without calling qdrant when ids is empty", async () => {
      const mocks = buildQdrantMocks();
      const repository = createClustersRepository({ qdrant: asClient(mocks) });

      const result = await repository.findByIds([]);

      expect(result).toEqual([]);
      expect(mocks.retrieve).not.toHaveBeenCalled();
    });
  });
});
