import { QdrantClient } from "@qdrant/js-client-rest";
import { describe, expect, it, vi } from "vitest";
import type { ContentItem } from "@map-of-science/atlas";
import { withQdrantContainer } from "@map-of-science/test-utils";
import { createCollectionSchema } from "../collection/create-collection-schema.js";
import { createContentRepository } from "./content.js";

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
  repository: ReturnType<typeof createContentRepository>;
  client: QdrantClient;
};

const withContentRepository = (test: (deps: Deps) => Promise<void>) =>
  withQdrantContainer(async (qdrant) => {
    const client = new QdrantClient({ url: qdrant.url });
    const repository = createContentRepository({ qdrant: client });
    await test({ repository, client });
  });

const withReadyContentRepository = (test: (deps: Deps) => Promise<void>) =>
  withContentRepository(async (deps) => {
    await deps.repository.createSchema();
    await test(deps);
  });

const buildContentItem = (
  overrides: Partial<ContentItem> = {},
): ContentItem => ({
  id: "550e8400-e29b-41d4-a716-446655440200",
  type: "youtube-segment",
  title: "Intro to Quantum Computing",
  url: "https://www.youtube.com/watch?v=abc123&t=42s",
  metadata: {
    videoId: "abc123",
    segmentUrl: "https://www.youtube.com/watch?v=abc123&t=42s",
    segmentName: "Qubits explained",
    date: "2026-01-15",
  },
  entityRefs: [{ type: "cluster", id: "550e8400-e29b-41d4-a716-446655440001" }],
  ...overrides,
});

describe("content repository", () => {
  it(
    "should create the content schema",
    withContentRepository(async ({ repository }) => {
      vi.mocked(createCollectionSchema).mockClear();

      await repository.createSchema();

      expect(createCollectionSchema).toHaveBeenCalledTimes(1);
      expect(createCollectionSchema).toHaveBeenNthCalledWith(
        1,
        expect.any(QdrantClient),
        {
          name: "content_items",
          vectors: {
            _placeholder: { size: 1, distance: "Cosine" },
          },
          payloadIndexes: [
            { field_name: "cluster_ids", field_schema: "keyword" },
            { field_name: "area_ids", field_schema: "keyword" },
            { field_name: "type", field_schema: "keyword" },
          ],
        },
      );
    }),
    60_000,
  );

  it(
    "should save a content item and read it back by cluster id",
    withReadyContentRepository(async ({ repository }) => {
      const clusterId = "550e8400-e29b-41d4-a716-446655440001";
      const item = buildContentItem({
        entityRefs: [{ type: "cluster", id: clusterId }],
      });
      await repository.upsert([item]);

      const found = await repository.findByClusterId(clusterId);
      expect(found).toEqual([item]);
    }),
    60_000,
  );

  it(
    "should return every content item linked to a given cluster",
    withReadyContentRepository(async ({ repository }) => {
      const clusterId = "550e8400-e29b-41d4-a716-446655440002";
      const first = buildContentItem({
        id: "550e8400-e29b-41d4-a716-446655440210",
        title: "First video",
        entityRefs: [{ type: "cluster", id: clusterId }],
      });
      const second = buildContentItem({
        id: "550e8400-e29b-41d4-a716-446655440211",
        title: "Second video",
        entityRefs: [{ type: "cluster", id: clusterId }],
      });
      const unrelated = buildContentItem({
        id: "550e8400-e29b-41d4-a716-446655440212",
        title: "Unrelated video",
        entityRefs: [
          { type: "cluster", id: "550e8400-e29b-41d4-a716-446655440999" },
        ],
      });
      await repository.upsert([first, second, unrelated]);

      const found = await repository.findByClusterId(clusterId);
      expect(found.map((item) => item.title).sort()).toEqual([
        "First video",
        "Second video",
      ]);
    }),
    60_000,
  );

  it(
    "should return an empty array when no content links to the cluster",
    withReadyContentRepository(async ({ repository }) => {
      const found = await repository.findByClusterId(
        "550e8400-e29b-41d4-a716-446655440998",
      );
      expect(found).toEqual([]);
    }),
    60_000,
  );

  it(
    "should save a content item with an area ref and read it back by area id",
    withReadyContentRepository(async ({ repository }) => {
      const areaId = "550e8400-e29b-41d4-a716-446655441001";
      const item = buildContentItem({
        entityRefs: [{ type: "area", id: areaId }],
      });
      await repository.upsert([item]);

      const found = await repository.findByAreaId(areaId);
      expect(found).toEqual([item]);
    }),
    60_000,
  );

  it(
    "should return every content item linked to a given area",
    withReadyContentRepository(async ({ repository }) => {
      const areaId = "550e8400-e29b-41d4-a716-446655441002";
      const first = buildContentItem({
        id: "550e8400-e29b-41d4-a716-446655441210",
        title: "First video",
        entityRefs: [{ type: "area", id: areaId }],
      });
      const second = buildContentItem({
        id: "550e8400-e29b-41d4-a716-446655441211",
        title: "Second video",
        entityRefs: [{ type: "area", id: areaId }],
      });
      const unrelated = buildContentItem({
        id: "550e8400-e29b-41d4-a716-446655441212",
        title: "Unrelated video",
        entityRefs: [
          { type: "area", id: "550e8400-e29b-41d4-a716-446655441999" },
        ],
      });
      await repository.upsert([first, second, unrelated]);

      const found = await repository.findByAreaId(areaId);
      expect(found).toHaveLength(2);
      expect(found).toEqual(expect.arrayContaining([first, second]));
    }),
    60_000,
  );

  it(
    "should return an empty array when no content links to the area",
    withReadyContentRepository(async ({ repository }) => {
      const found = await repository.findByAreaId(
        "550e8400-e29b-41d4-a716-446655441998",
      );
      expect(found).toEqual([]);
    }),
    60_000,
  );

  it(
    "should find an item by either cluster or area when its entityRefs mix both",
    withReadyContentRepository(async ({ repository }) => {
      const clusterId = "550e8400-e29b-41d4-a716-446655440003";
      const areaId = "550e8400-e29b-41d4-a716-446655441003";
      const item = buildContentItem({
        entityRefs: [
          { type: "cluster", id: clusterId },
          { type: "area", id: areaId },
        ],
      });
      await repository.upsert([item]);

      expect(await repository.findByClusterId(clusterId)).toEqual([item]);
      expect(await repository.findByAreaId(areaId)).toEqual([item]);
    }),
    60_000,
  );
});
