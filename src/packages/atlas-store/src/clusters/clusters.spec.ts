import type { QdrantClient } from "@qdrant/js-client-rest";
import { describe, expect, it, vi } from "vitest";
import type { ClusterInput } from "@map-of-science/atlas";
import {
  toAssociationsPayload,
  toAttributesPayload,
} from "./clusterPayload.js";
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
  describe("findById", () => {
    const id = "7c411b5e-9d3f-50b5-9c28-62096e41c4ed";
    const retrieveArgs = { ids: [id], with_payload: true, with_vector: false };

    it("should read both collections at the same point id", async () => {
      const mocks = buildQdrantMocks();
      const input = buildInput(42);
      mocks.retrieve
        .mockResolvedValueOnce([{ id, payload: toAttributesPayload(input) }])
        .mockResolvedValueOnce([{ id, payload: toAssociationsPayload(input) }]);
      const repository = createClustersRepository({ qdrant: asClient(mocks) });

      const found = await repository.findById(id);

      expect(found?.externalId).toBe(42);
      expect(mocks.retrieve).toHaveBeenCalledTimes(2);
      expect(mocks.retrieve).toHaveBeenNthCalledWith(
        1,
        "clusters",
        retrieveArgs,
      );
      expect(mocks.retrieve).toHaveBeenNthCalledWith(
        2,
        "cluster_associations",
        retrieveArgs,
      );
    });

    it.each([
      ["the attributes record is missing", [] as unknown[], [{ id }]],
      ["the associations record is missing", [{ id }], [] as unknown[]],
    ])("should return null when %s", async (_, attributes, associations) => {
      const mocks = buildQdrantMocks();
      mocks.retrieve
        .mockResolvedValueOnce(attributes)
        .mockResolvedValueOnce(associations);
      const repository = createClustersRepository({
        qdrant: asClient(mocks),
      });

      expect(await repository.findById(id)).toBeNull();
    });
  });

  describe("upsert", () => {
    it("should address the point in both collections by the uuid derived from its external id", async () => {
      const mocks = buildQdrantMocks();
      const repository = createClustersRepository({ qdrant: asClient(mocks) });

      await repository.upsert([buildInput(42)]);

      expect(mocks.upsert).toHaveBeenCalledTimes(2);
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
      expect(mocks.upsert).toHaveBeenNthCalledWith(
        2,
        "cluster_associations",
        expect.objectContaining({
          points: [
            expect.objectContaining({
              id: "7c411b5e-9d3f-50b5-9c28-62096e41c4ed",
              vector: {},
            }),
          ],
        }),
      );
    });
  });
});
