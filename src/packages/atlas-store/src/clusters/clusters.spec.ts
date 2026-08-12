import type { QdrantClient } from "@qdrant/js-client-rest";
import { describe, expect, it, vi } from "vitest";
import type { ClusterInput } from "@map-of-science/atlas";
import { createClustersRepository } from "./clusters.js";

const buildQdrantMocks = () => ({
  upsert: vi.fn().mockResolvedValue({}),
  retrieve: vi.fn().mockResolvedValue([]),
  scroll: vi.fn().mockResolvedValue({ points: [] }),
  query: vi.fn().mockResolvedValue({ points: [] }),
});

const asClient = (mocks: ReturnType<typeof buildQdrantMocks>) =>
  mocks as unknown as QdrantClient;

const buildInput = (externalId: number): ClusterInput => ({
  externalId,
  position: { x: 1, y: 2 },
  name: null,
  nameSource: null,
  articlesCount: 10,
  growthRating: 50,
  embedding: { model: "m", source: "s" },
  keyConcepts: [],
  averageArticleAgeYears: 5.8,
  citationRating: 75.47,
  patentRating: 99.78,
  topJournals: [],
  topInstitutions: [],
  topCompanies: [],
  articles: { core: [], review: [], highlyCited: [] },
  relatedClusters: { topCiting: [], topCited: [] },
  vector: Array.from({ length: 768 }, () => 0),
});

describe("createClustersRepository", () => {
  describe("upsert", () => {
    it("should address a point by the uuid derived from its external id", async () => {
      const mocks = buildQdrantMocks();
      const repository = createClustersRepository({ qdrant: asClient(mocks) });

      await repository.upsert([buildInput(42)]);

      expect(mocks.upsert).toHaveBeenCalledTimes(1);
      expect(mocks.upsert).toHaveBeenNthCalledWith(
        1,
        "clusters",
        expect.objectContaining({
          points: [
            expect.objectContaining({
              id: "7c411b5e-9d3f-50b5-9c28-62096e41c4ed",
            }),
          ],
        }),
      );
    });
  });

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
