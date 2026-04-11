import { QdrantClient } from "@qdrant/js-client-rest";
import { describe, expect, it } from "vitest";
import type { ClusterInput } from "@map-of-science/atlas";
// TODO: inline the Qdrant testcontainers helper here and drop the
// vector-store devDep once no other consumer remains.
import { withQdrantContainer } from "@map-of-science/vector-store/test";
import { createClustersRepository } from "./clusters.js";

type Deps = {
  repository: ReturnType<typeof createClustersRepository>;
  client: QdrantClient;
};

const withClusterRepository = (test: (deps: Deps) => Promise<void>) =>
  withQdrantContainer(async (qdrant) => {
    const client = new QdrantClient({ url: qdrant.url });
    const repository = createClustersRepository({ qdrant: client });
    await test({ repository, client });
  });

const withReadyClusterRepository = (test: (deps: Deps) => Promise<void>) =>
  withClusterRepository(async (deps) => {
    await deps.repository.ensureCollection();
    await test(deps);
  });

const buildClusterInput = (
  overrides: Partial<ClusterInput> = {},
): ClusterInput => ({
  id: "550e8400-e29b-41d4-a716-446655440001",
  externalId: 1,
  position: { x: 12.5, y: -8.25 },
  name: { en_US: "Machine Learning", pl_PL: "Uczenie Maszynowe" },
  nameSource: "llm",
  articlesCount: 1200,
  growthRating: 73.4,
  embedding: { model: "gemini-embedding-001", source: "article-titles" },
  vector: Array.from({ length: 768 }, (_, index) => (index === 0 ? 1 : 0)),
  ...overrides,
});

describe("clusters repository", () => {
  it(
    "should create the clusters collection with the titles vector",
    withClusterRepository(async ({ repository, client }) => {
      await repository.ensureCollection();

      const collection = await client.getCollection("clusters");
      expect(collection.config.params.vectors).toMatchObject({
        titles: { size: 768, distance: "Cosine" },
      });
    }),
    60_000,
  );

  it(
    "should be idempotent when the collection already exists",
    withClusterRepository(async ({ repository }) => {
      await repository.ensureCollection();
      await expect(repository.ensureCollection()).resolves.not.toThrow();
    }),
    60_000,
  );

  it(
    "should create payload indexes for spatial and metric fields",
    withClusterRepository(async ({ repository, client }) => {
      await repository.ensureCollection();

      const collection = await client.getCollection("clusters");
      expect(collection.payload_schema).toMatchObject({
        x: { data_type: "float" },
        y: { data_type: "float" },
        articlesCount: { data_type: "integer" },
        growthRating: { data_type: "float" },
      });
    }),
    60_000,
  );

  it(
    "should save a cluster and read it back by id",
    withReadyClusterRepository(async ({ repository }) => {
      const input = buildClusterInput();
      await repository.upsert([input]);

      const { vector, ...expected } = input;
      expect(vector).toHaveLength(768);
      const found = await repository.findById(input.id);
      expect(found).toEqual(expected);
    }),
    60_000,
  );

  it(
    "should return null when the cluster is not found",
    withReadyClusterRepository(async ({ repository }) => {
      const found = await repository.findById(
        "550e8400-e29b-41d4-a716-446655440099",
      );
      expect(found).toBeNull();
    }),
    60_000,
  );

  it(
    "should fetch many clusters in one call with findByIds",
    withReadyClusterRepository(async ({ repository }) => {
      const first = buildClusterInput({
        id: "550e8400-e29b-41d4-a716-446655440010",
        externalId: 10,
      });
      const second = buildClusterInput({
        id: "550e8400-e29b-41d4-a716-446655440011",
        externalId: 11,
      });
      await repository.upsert([first, second]);

      const found = await repository.findByIds([first.id, second.id]);

      expect(found).toHaveLength(2);
      expect(found.map((cluster) => cluster.externalId).sort()).toEqual([
        10, 11,
      ]);
    }),
    60_000,
  );

  it(
    "should return an empty array when findByIds is called with no ids",
    withReadyClusterRepository(async ({ repository }) => {
      const found = await repository.findByIds([]);
      expect(found).toEqual([]);
    }),
    60_000,
  );

  it(
    "should return only clusters whose position falls inside the bbox",
    withReadyClusterRepository(async ({ repository }) => {
      const inside = buildClusterInput({
        id: "550e8400-e29b-41d4-a716-446655440020",
        externalId: 20,
        position: { x: 5, y: 5 },
      });
      const outsideX = buildClusterInput({
        id: "550e8400-e29b-41d4-a716-446655440021",
        externalId: 21,
        position: { x: 50, y: 5 },
      });
      const outsideY = buildClusterInput({
        id: "550e8400-e29b-41d4-a716-446655440022",
        externalId: 22,
        position: { x: 5, y: 50 },
      });
      await repository.upsert([inside, outsideX, outsideY]);

      const found = await repository.findInViewport({
        bbox: { x: { min: 0, max: 10 }, y: { min: 0, max: 10 } },
        limit: 10,
      });

      expect(found).toHaveLength(1);
      expect(found[0].externalId).toBe(20);
    }),
    60_000,
  );

  it(
    "should order clusters inside the viewport by articlesCount desc",
    withReadyClusterRepository(async ({ repository }) => {
      const small = buildClusterInput({
        id: "550e8400-e29b-41d4-a716-446655440030",
        externalId: 30,
        position: { x: 1, y: 1 },
        articlesCount: 100,
      });
      const huge = buildClusterInput({
        id: "550e8400-e29b-41d4-a716-446655440031",
        externalId: 31,
        position: { x: 2, y: 2 },
        articlesCount: 5000,
      });
      const medium = buildClusterInput({
        id: "550e8400-e29b-41d4-a716-446655440032",
        externalId: 32,
        position: { x: 3, y: 3 },
        articlesCount: 800,
      });
      await repository.upsert([small, huge, medium]);

      const found = await repository.findInViewport({
        bbox: { x: { min: 0, max: 10 }, y: { min: 0, max: 10 } },
        limit: 10,
      });

      expect(found.map((cluster) => cluster.externalId)).toEqual([31, 32, 30]);
    }),
    60_000,
  );

  it(
    "should cap the viewport result at the requested limit",
    withReadyClusterRepository(async ({ repository }) => {
      const inputs = [100, 200, 300, 400].map((articlesCount, index) =>
        buildClusterInput({
          id: `550e8400-e29b-41d4-a716-44665544004${index}`,
          externalId: 40 + index,
          position: { x: index, y: index },
          articlesCount,
        }),
      );
      await repository.upsert(inputs);

      const found = await repository.findInViewport({
        bbox: { x: { min: -1, max: 10 }, y: { min: -1, max: 10 } },
        limit: 2,
      });

      expect(found).toHaveLength(2);
      expect(found.map((cluster) => cluster.articlesCount)).toEqual([400, 300]);
    }),
    60_000,
  );

  it(
    "should rank the cluster whose vector matches the query higher than an unrelated one",
    withReadyClusterRepository(async ({ repository }) => {
      const queryVector = Array.from({ length: 768 }, (_, index) =>
        index === 0 ? 1 : 0,
      );
      const otherVector = Array.from({ length: 768 }, (_, index) =>
        index === 1 ? 1 : 0,
      );

      const matching = buildClusterInput({
        id: "550e8400-e29b-41d4-a716-446655440050",
        externalId: 50,
        vector: queryVector,
      });
      const unrelated = buildClusterInput({
        id: "550e8400-e29b-41d4-a716-446655440051",
        externalId: 51,
        vector: otherVector,
      });
      await repository.upsert([matching, unrelated]);

      const matches = await repository.findByVector({
        vector: queryVector,
        limit: 2,
      });

      expect(matches).toHaveLength(2);
      expect(matches[0].externalId).toBe(50);
      expect(matches[0].score).toBeGreaterThan(matches[1].score);
    }),
    60_000,
  );
});
