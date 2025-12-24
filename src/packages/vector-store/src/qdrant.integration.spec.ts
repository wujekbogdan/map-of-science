import { QdrantClient } from "@qdrant/js-client-rest";
import { describe, it, expect } from "vitest";
import { createQdrantStore } from "./qdrant.js";
import { withQdrantContainer } from "./test-utils/useQdrantContainer.js";

const VECTOR_NAME = "embedding";

describe("Qdrant integration", () => {
  it(
    "should upsert and search vectors",
    withQdrantContainer(async (qdrant) => {
      const store = createQdrantStore({
        url: qdrant.url,
        collectionName: "test-integration",
        vectors: { [VECTOR_NAME]: { size: 3 } },
      });

      await store.upsert({
        id: "550e8400-e29b-41d4-a716-446655440001",
        vectors: { [VECTOR_NAME]: [1, 0, 0] },
        metadata: { label: "first" },
      });

      await store.upsert({
        id: "550e8400-e29b-41d4-a716-446655440002",
        vectors: { [VECTOR_NAME]: [0, 1, 0] },
        metadata: { label: "second" },
      });

      const results = await store.search({
        using: VECTOR_NAME,
        vector: [0.9, 0.1, 0],
        limit: 10,
        scoreThreshold: 0.5,
      });
      expect(results.items.length).toBeGreaterThan(0);
      expect(results.items[0].metadata?.label).toBe("first");
      expect(results.items[0].score).toBeGreaterThan(0.5);

      const filtered = await store.search({
        using: VECTOR_NAME,
        vector: [0.1, 0.9, 0],
        filter: [{ key: "label", match: "second" }],
        limit: 10,
        scoreThreshold: 0.5,
      });
      expect(filtered.items).toHaveLength(1);
      expect(filtered.items[0].metadata?.label).toBe("second");

      const byFilter = await store.search({
        filter: [{ key: "label", match: "first" }],
      });
      expect(byFilter.items).toHaveLength(1);
      expect(byFilter.items[0].metadata?.label).toBe("first");
      expect(byFilter.items[0].score).toBe(1);
    }),
    60_000,
  );

  it(
    "should get a point by id",
    withQdrantContainer(async (qdrant) => {
      const store = createQdrantStore({
        url: qdrant.url,
        collectionName: "test-get",
        vectors: { [VECTOR_NAME]: { size: 3 } },
      });

      const id = "550e8400-e29b-41d4-a716-446655440006";
      await store.upsert({
        id,
        vectors: { [VECTOR_NAME]: [1, 0, 0] },
        metadata: { label: "test" },
      });

      const result = await store.get(id);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(id);
      expect(result?.vectors[VECTOR_NAME]).toEqual([1, 0, 0]);
      expect(result?.metadata).toEqual({ label: "test" });
    }),
  );

  it(
    "should return null for non-existent id",
    withQdrantContainer(async (qdrant) => {
      const store = createQdrantStore({
        url: qdrant.url,
        collectionName: "test-get-null",
        vectors: { [VECTOR_NAME]: { size: 3 } },
      });

      await store.upsert({
        id: "550e8400-e29b-41d4-a716-446655440007",
        vectors: { [VECTOR_NAME]: [1, 0, 0] },
      });

      const result = await store.get("550e8400-e29b-41d4-a716-446655440099");

      expect(result).toBeNull();
    }),
  );

  it(
    "should delete a point",
    withQdrantContainer(async (qdrant) => {
      const store = createQdrantStore({
        url: qdrant.url,
        collectionName: "test-delete",
        vectors: { [VECTOR_NAME]: { size: 3 } },
      });

      const id = "550e8400-e29b-41d4-a716-446655440008";
      await store.upsert({
        id,
        vectors: { [VECTOR_NAME]: [1, 0, 0] },
        metadata: { label: "to-delete" },
      });

      expect(await store.get(id)).not.toBeNull();

      await store.delete(id);

      expect(await store.get(id)).toBeNull();
    }),
  );

  it(
    "should update metadata without changing vector",
    withQdrantContainer(async (qdrant) => {
      const store = createQdrantStore({
        url: qdrant.url,
        collectionName: "test-update-metadata",
        vectors: { [VECTOR_NAME]: { size: 3 } },
      });

      const id = "550e8400-e29b-41d4-a716-446655440009";
      await store.upsert({
        id,
        vectors: { [VECTOR_NAME]: [1, 0, 0] },
        metadata: { status: "draft", title: "Original" },
      });

      await store.updateMetadata(id, { status: "approved", title: "Updated" });

      const result = await store.get(id);

      expect(result?.vectors[VECTOR_NAME]).toEqual([1, 0, 0]);
      expect(result?.metadata).toEqual({
        status: "approved",
        title: "Updated",
      });
    }),
  );

  it(
    "should create payload indexes when collection is created",
    withQdrantContainer(async (qdrant) => {
      const collectionName = "test-payload-indexes";

      const store = createQdrantStore({
        url: qdrant.url,
        collectionName,
        vectors: { [VECTOR_NAME]: { size: 3 } },
        payloadIndexes: [
          { field: "category", type: "keyword" },
          { field: "priority", type: "integer" },
        ],
      });

      await store.upsert({
        id: "550e8400-e29b-41d4-a716-446655440010",
        vectors: { [VECTOR_NAME]: [1, 0, 0] },
        metadata: { category: "test", priority: 1 },
      });

      const client = new QdrantClient({ url: qdrant.url });
      const collection = await client.getCollection(collectionName);

      expect(collection.payload_schema).toMatchObject({
        category: { data_type: "keyword" },
        priority: { data_type: "integer" },
      });
    }),
  );

  it(
    "should paginate vector search results",
    withQdrantContainer(async (qdrant) => {
      const store = createQdrantStore({
        url: qdrant.url,
        collectionName: "test-pagination-vector",
        vectors: { [VECTOR_NAME]: { size: 3 } },
      });

      await Promise.all([
        store.upsert({
          id: "550e8400-e29b-41d4-a716-446655440051",
          vectors: { [VECTOR_NAME]: [1, 0, 0] },
        }),
        store.upsert({
          id: "550e8400-e29b-41d4-a716-446655440052",
          vectors: { [VECTOR_NAME]: [0.9, 0.1, 0] },
        }),
        store.upsert({
          id: "550e8400-e29b-41d4-a716-446655440053",
          vectors: { [VECTOR_NAME]: [0.8, 0.2, 0] },
        }),
      ]);

      const page1 = await store.search({
        using: VECTOR_NAME,
        vector: [1, 0, 0],
        limit: 2,
        scoreThreshold: 0.5,
      });
      expect(page1.items).toHaveLength(2);
      expect(page1.nextOffset).toBe(2);

      const page2 = await store.search({
        using: VECTOR_NAME,
        vector: [1, 0, 0],
        limit: 2,
        offset: page1.nextOffset as number,
        scoreThreshold: 0.5,
      });
      expect(page2.items).toHaveLength(1);
      expect(page2.nextOffset).toBeNull();
    }),
    60_000,
  );

  it(
    "should paginate filter-only search results using PointId offset",
    withQdrantContainer(async (qdrant) => {
      const store = createQdrantStore({
        url: qdrant.url,
        collectionName: `test-pagination-filter-${Date.now()}`,
        vectors: { [VECTOR_NAME]: { size: 3 } },
      });

      await Promise.all([
        store.upsert({
          id: "550e8400-e29b-41d4-a716-446655440021",
          vectors: { [VECTOR_NAME]: [1, 0, 0] },
          metadata: { type: "a" },
        }),
        store.upsert({
          id: "550e8400-e29b-41d4-a716-446655440022",
          vectors: { [VECTOR_NAME]: [0, 1, 0] },
          metadata: { type: "a" },
        }),
        store.upsert({
          id: "550e8400-e29b-41d4-a716-446655440023",
          vectors: { [VECTOR_NAME]: [0, 0, 1] },
          metadata: { type: "a" },
        }),
      ]);

      const page1 = await store.search({
        filter: [{ key: "type", match: "a" }],
        limit: 2,
      });
      expect(page1.items).toHaveLength(2);
      expect(typeof page1.nextOffset).toBe("string");

      const page2 = await store.search({
        filter: [{ key: "type", match: "a" }],
        limit: 2,
        offset: page1.nextOffset as string,
      });
      expect(page2.items).toHaveLength(1);
      expect(page2.nextOffset).toBeNull();
      expect(page2.items[0].id).not.toBe(page1.items[0].id);
      expect(page2.items[0].id).not.toBe(page1.items[1].id);
    }),
    60_000,
  );

  it(
    "should order filter-only search results by payload field",
    withQdrantContainer(async (qdrant) => {
      const store = createQdrantStore({
        url: qdrant.url,
        collectionName: `test-order-by-${Date.now()}`,
        vectors: { [VECTOR_NAME]: { size: 3 } },
        payloadIndexes: [{ field: "createdAt", type: "integer" }],
      });

      await store.upsert({
        id: "550e8400-e29b-41d4-a716-446655440031",
        vectors: { [VECTOR_NAME]: [1, 0, 0] },
        metadata: { createdAt: 200 },
      });
      await store.upsert({
        id: "550e8400-e29b-41d4-a716-446655440032",
        vectors: { [VECTOR_NAME]: [0, 1, 0] },
        metadata: { createdAt: 100 },
      });
      await store.upsert({
        id: "550e8400-e29b-41d4-a716-446655440033",
        vectors: { [VECTOR_NAME]: [0, 0, 1] },
        metadata: { createdAt: 300 },
      });

      const ascResults = await store.search({
        filter: [],
        orderBy: { key: "createdAt", direction: "asc" },
      });
      expect(ascResults.items.map((i) => i.metadata?.createdAt)).toEqual([
        100, 200, 300,
      ]);

      const descResults = await store.search({
        filter: [],
        orderBy: { key: "createdAt", direction: "desc" },
      });
      expect(descResults.items.map((i) => i.metadata?.createdAt)).toEqual([
        300, 200, 100,
      ]);
    }),
    60_000,
  );

  it.each([
    { direction: "desc" as const, firstPage: [300, 200], lastItem: 100 },
    { direction: "asc" as const, firstPage: [100, 200], lastItem: 300 },
  ])(
    "should paginate filter-only search with orderBy $direction",
    async ({ direction, firstPage, lastItem }) => {
      await withQdrantContainer(async (qdrant) => {
        const store = createQdrantStore({
          url: qdrant.url,
          collectionName: `test-orderby-pagination-${direction}-${Date.now()}`,
          vectors: { [VECTOR_NAME]: { size: 3 } },
          payloadIndexes: [{ field: "createdAt", type: "integer" }],
        });

        await store.upsert({
          id: "550e8400-e29b-41d4-a716-446655440041",
          vectors: { [VECTOR_NAME]: [1, 0, 0] },
          metadata: { createdAt: 300 },
        });
        await store.upsert({
          id: "550e8400-e29b-41d4-a716-446655440042",
          vectors: { [VECTOR_NAME]: [0, 1, 0] },
          metadata: { createdAt: 200 },
        });
        await store.upsert({
          id: "550e8400-e29b-41d4-a716-446655440043",
          vectors: { [VECTOR_NAME]: [0, 0, 1] },
          metadata: { createdAt: 100 },
        });

        const page1 = await store.search({
          filter: [],
          limit: 2,
          orderBy: { key: "createdAt", direction },
        });
        expect(page1.items).toHaveLength(2);
        expect(page1.items.map((i) => i.metadata?.createdAt)).toEqual(
          firstPage,
        );
        expect(page1.nextOffset).not.toBeNull();

        const page2 = await store.search({
          filter: [],
          limit: 2,
          offset: page1.nextOffset as string,
          orderBy: { key: "createdAt", direction },
        });
        expect(page2.items).toHaveLength(1);
        expect(page2.items[0].metadata?.createdAt).toBe(lastItem);
        expect(page2.nextOffset).toBeNull();
      })();
    },
    60_000,
  );
});
