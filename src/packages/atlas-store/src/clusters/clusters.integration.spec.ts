import { QdrantClient } from "@qdrant/js-client-rest";
import { describe, expect, it, vi } from "vitest";
import type { ClusterInput } from "@map-of-science/atlas";
import { withQdrantContainer } from "@map-of-science/test-utils";
import { createCollectionSchema } from "../collection/create-collection-schema.js";
import { createClusterAttributesReader } from "./clusterAttributesReader.js";
import { createClustersRepository } from "./clusters.js";

vi.mock("../collection/create-collection-schema.js", async () => {
  const actual = await vi.importActual<
    typeof import("../collection/create-collection-schema.js")
  >("../collection/create-collection-schema.js");
  return {
    ...actual,
    createCollectionSchema: vi.fn(actual.createCollectionSchema),
  };
});

type Deps = {
  repository: ReturnType<typeof createClustersRepository>;
  reader: ReturnType<typeof createClusterAttributesReader>;
  client: QdrantClient;
};

const withClusterRepository = (test: (deps: Deps) => Promise<void>) =>
  withQdrantContainer(async (qdrant) => {
    const client = new QdrantClient({ url: qdrant.url });
    const repository = createClustersRepository({ qdrant: client });
    const reader = createClusterAttributesReader({ qdrant: client });
    await test({ repository, reader, client });
  });

const withReadyClusterRepository = (test: (deps: Deps) => Promise<void>) =>
  withClusterRepository(async (deps) => {
    await deps.repository.createSchema();
    await test(deps);
  });

const storedPointIds = async (client: QdrantClient) => {
  const { points } = await client.scroll("clusters", {
    limit: 100,
    with_payload: false,
    with_vector: false,
  });
  return points.map((point) => String(point.id));
};

const buildClusterInput = (
  overrides: Partial<ClusterInput> = {},
): ClusterInput => ({
  externalId: 1,
  position: { x: 12.5, y: -8.25 },
  name: { en_US: "Machine Learning", pl_PL: "Uczenie Maszynowe" },
  nameSource: "llm",
  articlesCount: 1200,
  growthRating: 73.4,
  embedding: { model: "gemini-embedding-001", source: "article-titles" },
  keyConcepts: [],
  averageArticleAgeYears: 5.8,
  citationRating: 75.47,
  patentRating: 99.78,
  topJournals: ["Nature", "Science advances"],
  topInstitutions: ["Centre National de la Recherche Scientifique"],
  topCompanies: [],
  articles: {
    core: [
      {
        title: "Attention is all you need",
        metadata: "2017: Advances in neural information processing systems",
        citations: 120000,
        doi: "10.48550/arXiv.1706.03762",
      },
    ],
    review: [],
    highlyCited: [
      { title: "Deep learning", metadata: "2015", citations: 90000, doi: null },
    ],
  },
  relatedClusters: {
    topCiting: [{ externalId: 0, significantCitations: 35 }],
    topCited: [],
  },
  vector: Array.from({ length: 768 }, (_, index) => (index === 0 ? 1 : 0)),
  ...overrides,
});

describe("clusters repository", () => {
  it(
    "should create a collection for the attributes and a vectorless one for the associations",
    withClusterRepository(async ({ repository, client }) => {
      vi.mocked(createCollectionSchema).mockClear();

      await repository.createSchema();

      expect(createCollectionSchema).toHaveBeenCalledTimes(2);
      expect(createCollectionSchema).toHaveBeenNthCalledWith(
        1,
        expect.any(QdrantClient),
        {
          name: "clusters",
          vectors: {
            titles: { size: 768, distance: "Cosine" },
          },
          payloadIndexes: [
            { field_name: "x", field_schema: "float" },
            { field_name: "y", field_schema: "float" },
            { field_name: "articlesCount", field_schema: "integer" },
          ],
        },
      );
      expect(createCollectionSchema).toHaveBeenNthCalledWith(
        2,
        expect.any(QdrantClient),
        {
          name: "cluster_associations",
          vectors: {},
          payloadIndexes: [],
        },
      );

      const associations = await client.getCollection("cluster_associations");
      expect(associations.config.params.vectors).toEqual({});
    }),
    60_000,
  );

  it(
    "should write the attributes and the associations into their own collections under one point id",
    withReadyClusterRepository(async ({ repository, client }) => {
      await repository.upsert([buildClusterInput()]);

      const attributes = await client.scroll("clusters", {
        limit: 10,
        with_payload: true,
      });
      const associations = await client.scroll("cluster_associations", {
        limit: 10,
        with_payload: true,
      });

      expect(
        Object.keys(attributes.points[0]?.payload ?? {}).toSorted(),
      ).toEqual([
        "articlesCount",
        "averageArticleAgeYears",
        "citationRatingPercentile",
        "externalId",
        "growthRating",
        "keyConcepts",
        "name",
        "patentRatingPercentile",
        "x",
        "y",
      ]);
      expect(
        Object.keys(associations.points[0]?.payload ?? {}).toSorted(),
      ).toEqual([
        "articles",
        "embedding",
        "nameSource",
        "relatedClusters",
        "topCompanies",
        "topInstitutions",
        "topJournals",
      ]);
      expect(associations.points[0]?.id).toEqual(attributes.points[0]?.id);
    }),
    60_000,
  );

  it(
    "should save a cluster and read it back by id",
    withReadyClusterRepository(async ({ repository, client }) => {
      const input = buildClusterInput();
      await repository.upsert([input]);

      const [id] = await storedPointIds(client);
      const found = await repository.findById(id);

      const { vector, ...attributes } = input;
      expect(vector).toHaveLength(768);
      expect(found).toEqual({ ...attributes, id });
    }),
    60_000,
  );

  it(
    "should save and load keyConcepts",
    withReadyClusterRepository(async ({ repository, client }) => {
      await repository.upsert([
        buildClusterInput({
          keyConcepts: ["edible coatings", "shelf life", "Chitosan"],
        }),
      ]);

      const [id] = await storedPointIds(client);
      const found = await repository.findById(id);

      expect(found?.keyConcepts).toEqual([
        "edible coatings",
        "shelf life",
        "Chitosan",
      ]);
    }),
    60_000,
  );

  it(
    "should return an empty keyConcepts array when the payload has none",
    withReadyClusterRepository(async ({ repository, client }) => {
      const id = "550e8400-e29b-41d4-a716-446655440099";
      await client.upsert("clusters", {
        wait: true,
        points: [
          {
            id,
            vector: {
              titles: Array.from({ length: 768 }, (_, index) =>
                index === 0 ? 1 : 0,
              ),
            },
            payload: {
              externalId: 99,
              x: 0,
              y: 0,
              name: null,
              articlesCount: 1,
              growthRating: 0,
              averageArticleAgeYears: 0,
              citationRatingPercentile: 0,
              patentRatingPercentile: 0,
            },
          },
        ],
      });
      await client.upsert("cluster_associations", {
        wait: true,
        points: [
          {
            id,
            vector: {},
            payload: {
              nameSource: null,
              embedding: {
                model: "gemini-embedding-001",
                source: "article-titles",
              },
              topJournals: [],
              topInstitutions: [],
              topCompanies: [],
              articles: { core: [], review: [], highlyCited: [] },
              relatedClusters: { topCiting: [], topCited: [] },
            },
          },
        ],
      });

      const found = await repository.findById(id);
      expect(found?.keyConcepts).toEqual([]);
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
    "should return null when the cluster is stored in only one collection",
    withReadyClusterRepository(async ({ repository, client }) => {
      await repository.upsert([buildClusterInput()]);
      const [id] = await storedPointIds(client);

      await client.delete("cluster_associations", {
        wait: true,
        points: [id],
      });

      expect(await repository.findById(id)).toBeNull();
    }),
    60_000,
  );

  it(
    "should return the map attributes of only the clusters inside the bbox",
    withReadyClusterRepository(async ({ repository, reader }) => {
      const inside = buildClusterInput({
        externalId: 20,
        position: { x: 5, y: 5 },
      });
      const outsideX = buildClusterInput({
        externalId: 21,
        position: { x: 50, y: 5 },
      });
      const outsideY = buildClusterInput({
        externalId: 22,
        position: { x: 5, y: 50 },
      });
      await repository.upsert([inside, outsideX, outsideY]);

      const found = await reader.findInViewport({
        bbox: { x: { min: 0, max: 10 }, y: { min: 0, max: 10 } },
        limit: 10,
      });

      expect(found).toHaveLength(1);
      expect(found[0].externalId).toBe(20);
      expect(Object.keys(found[0]).toSorted()).toEqual([
        "articlesCount",
        "externalId",
        "growthRating",
        "id",
        "keyConcepts",
        "name",
        "position",
      ]);
    }),
    60_000,
  );

  it(
    "should order clusters inside the viewport by articlesCount desc",
    withReadyClusterRepository(async ({ repository, reader }) => {
      const small = buildClusterInput({
        externalId: 30,
        position: { x: 1, y: 1 },
        articlesCount: 100,
      });
      const huge = buildClusterInput({
        externalId: 31,
        position: { x: 2, y: 2 },
        articlesCount: 5000,
      });
      const medium = buildClusterInput({
        externalId: 32,
        position: { x: 3, y: 3 },
        articlesCount: 800,
      });
      await repository.upsert([small, huge, medium]);

      const found = await reader.findInViewport({
        bbox: { x: { min: 0, max: 10 }, y: { min: 0, max: 10 } },
        limit: 10,
      });

      expect(found.map((cluster) => cluster.externalId)).toEqual([31, 32, 30]);
    }),
    60_000,
  );

  it(
    "should cap the viewport result at the requested limit",
    withReadyClusterRepository(async ({ repository, reader }) => {
      const inputs = [100, 200, 300, 400].map((articlesCount, index) =>
        buildClusterInput({
          externalId: 40 + index,
          position: { x: index, y: index },
          articlesCount,
        }),
      );
      await repository.upsert(inputs);

      const found = await reader.findInViewport({
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
    withReadyClusterRepository(async ({ repository, reader }) => {
      const queryVector = Array.from({ length: 768 }, (_, index) =>
        index === 0 ? 1 : 0,
      );
      const otherVector = Array.from({ length: 768 }, (_, index) =>
        index === 1 ? 1 : 0,
      );

      const matching = buildClusterInput({
        externalId: 50,
        vector: queryVector,
      });
      const unrelated = buildClusterInput({
        externalId: 51,
        vector: otherVector,
      });
      await repository.upsert([matching, unrelated]);

      const matches = await reader.findByVector({
        vector: queryVector,
        limit: 2,
        minScore: -1,
      });

      expect(matches).toHaveLength(2);
      expect(matches[0].externalId).toBe(50);
      expect(matches[0].score).toBeGreaterThan(matches[1].score);
      expect(Object.keys(matches[0]).toSorted()).toEqual([
        "articlesCount",
        "externalId",
        "growthRating",
        "id",
        "keyConcepts",
        "name",
        "position",
        "score",
      ]);
    }),
    60_000,
  );
});
