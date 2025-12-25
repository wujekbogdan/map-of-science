import { QdrantClient } from "@qdrant/js-client-rest";
import { describe, it, expect } from "vitest";
import { createQdrantStore } from "./qdrant.js";
import { withQdrantContainer } from "./test-utils/useQdrantContainer.js";

const VECTOR_NAME = "embedding";

describe("Qdrant integration", () => {
  it(
    "should upsert vectors",
    withQdrantContainer(async (qdrant) => {
      const store = createQdrantStore({
        url: qdrant.url,
        collectionName: "test-upsert",
        vectors: { [VECTOR_NAME]: { size: 3 } },
      });

      await store.upsert({
        id: "550e8400-e29b-41d4-a716-446655440001",
        vectors: { [VECTOR_NAME]: [1, 0, 0] },
        metadata: { label: "first" },
      });

      const result = await store.get("550e8400-e29b-41d4-a716-446655440001");
      expect(result?.metadata?.label).toBe("first");
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

  describe("search", () => {
    describe("single vector", () => {
      it(
        "finds similar vectors with filter",
        withQdrantContainer(async (qdrant) => {
          const store = createQdrantStore({
            url: qdrant.url,
            collectionName: "test-single-vector",
            vectors: { [VECTOR_NAME]: { size: 3 } },
          });

          await store.upsert({
            id: "point-1",
            vectors: { [VECTOR_NAME]: [1, 0, 0] },
            metadata: { label: "first" },
          });
          await store.upsert({
            id: "point-2",
            vectors: { [VECTOR_NAME]: [0.9, 0.1, 0] },
            metadata: { label: "second" },
          });

          const results = await store.search({
            query: {
              type: "single",
              using: VECTOR_NAME,
              vector: [1, 0, 0],
              scoreThreshold: 0.5,
            },
            limit: 10,
          });
          expect(results.items[0].metadata?.label).toBe("first");
          expect(results.items[0].score).toBeGreaterThan(0.5);

          const filtered = await store.search({
            query: {
              type: "single",
              using: VECTOR_NAME,
              vector: [1, 0, 0],
              scoreThreshold: 0.5,
            },
            filter: [{ key: "label", match: "second" }],
            limit: 10,
          });
          expect(filtered.items).toHaveLength(1);
          expect(filtered.items[0].metadata?.label).toBe("second");
        }),
        60_000,
      );

      it(
        "paginates results",
        withQdrantContainer(async (qdrant) => {
          const store = createQdrantStore({
            url: qdrant.url,
            collectionName: "test-single-pagination",
            vectors: { [VECTOR_NAME]: { size: 3 } },
          });

          await Promise.all([
            store.upsert({
              id: "point-1",
              vectors: { [VECTOR_NAME]: [1, 0, 0] },
            }),
            store.upsert({
              id: "point-2",
              vectors: { [VECTOR_NAME]: [0.9, 0.1, 0] },
            }),
            store.upsert({
              id: "point-3",
              vectors: { [VECTOR_NAME]: [0.8, 0.2, 0] },
            }),
          ]);

          const page1 = await store.search({
            query: {
              type: "single",
              using: VECTOR_NAME,
              vector: [1, 0, 0],
              scoreThreshold: 0.5,
            },
            limit: 2,
          });
          expect(page1.items).toHaveLength(2);
          expect(page1.nextOffset).toBe(2);

          const page2 = await store.search({
            query: {
              type: "single",
              using: VECTOR_NAME,
              vector: [1, 0, 0],
              scoreThreshold: 0.5,
            },
            limit: 2,
            offset: page1.nextOffset as number,
          });
          expect(page2.items).toHaveLength(1);
          expect(page2.nextOffset).toBeNull();
        }),
        60_000,
      );
    });

    describe("multi vector", () => {
      it(
        "rrf boosts items appearing in both result lists",
        withQdrantContainer(async (qdrant) => {
          const store = createQdrantStore({
            url: qdrant.url,
            collectionName: "test-rrf",
            vectors: { primary: { size: 3 }, secondary: { size: 3 } },
          });

          // Point A: high primary score, low secondary score
          await store.upsert({
            id: "point-a",
            vectors: { primary: [1, 0, 0], secondary: [0, 0, 1] },
            metadata: { label: "A" },
          });

          // Point B: low primary score, high secondary score
          await store.upsert({
            id: "point-b",
            vectors: { primary: [0, 0, 1], secondary: [1, 0, 0] },
            metadata: { label: "B" },
          });

          // Point C: medium scores on both
          await store.upsert({
            id: "point-c",
            vectors: { primary: [0.7, 0.3, 0], secondary: [0.7, 0.3, 0] },
            metadata: { label: "C" },
          });

          const results = await store.search({
            query: {
              type: "multi",
              prefetch: [
                { vector: [1, 0, 0], using: "primary", limit: 10 },
                { vector: [1, 0, 0], using: "secondary", limit: 10 },
              ],
              fusion: { type: "rrf" },
            },
            limit: 3,
          });

          expect(results.items).toHaveLength(3);
          // With RRF, items appearing high in both lists get boosted
          // Point C should rank well as it scores decently on both vectors
          expect(results.items.map((r) => r.metadata?.label)).toContain("C");
        }),
        60_000,
      );

      it(
        "dbsf combines normalized scores",
        withQdrantContainer(async (qdrant) => {
          const store = createQdrantStore({
            url: qdrant.url,
            collectionName: "test-dbsf",
            vectors: { primary: { size: 3 }, secondary: { size: 3 } },
          });

          await store.upsert({
            id: "point-a",
            vectors: { primary: [1, 0, 0], secondary: [0.5, 0.5, 0] },
            metadata: { label: "A" },
          });
          await store.upsert({
            id: "point-b",
            vectors: { primary: [0.5, 0.5, 0], secondary: [1, 0, 0] },
            metadata: { label: "B" },
          });

          const results = await store.search({
            query: {
              type: "multi",
              prefetch: [
                { vector: [1, 0, 0], using: "primary", limit: 10 },
                { vector: [1, 0, 0], using: "secondary", limit: 10 },
              ],
              fusion: { type: "dbsf" },
            },
            limit: 2,
          });

          expect(results.items).toHaveLength(2);
        }),
        60_000,
      );

      it(
        "weightedSum favors vector with higher weight",
        withQdrantContainer(async (qdrant) => {
          const store = createQdrantStore({
            url: qdrant.url,
            collectionName: "test-weighted-sum",
            vectors: { primary: { size: 3 }, secondary: { size: 3 } },
          });

          await store.upsert({
            id: "point-a",
            vectors: { primary: [1, 0, 0], secondary: [0, 1, 0] },
            metadata: { label: "A" },
          });
          await store.upsert({
            id: "point-b",
            vectors: { primary: [0, 1, 0], secondary: [1, 0, 0] },
            metadata: { label: "B" },
          });

          const queryVector = [1, 0, 0];

          const primaryWeighted = await store.search({
            query: {
              type: "multi",
              prefetch: [
                { vector: queryVector, using: "primary", limit: 10 },
                { vector: queryVector, using: "secondary", limit: 10 },
              ],
              fusion: { type: "weightedSum", weights: [0.9, 0.1] },
            },
            limit: 2,
          });
          expect(primaryWeighted.items[0].metadata?.label).toBe("A");

          const secondaryWeighted = await store.search({
            query: {
              type: "multi",
              prefetch: [
                { vector: queryVector, using: "primary", limit: 10 },
                { vector: queryVector, using: "secondary", limit: 10 },
              ],
              fusion: { type: "weightedSum", weights: [0.1, 0.9] },
            },
            limit: 2,
          });
          expect(secondaryWeighted.items[0].metadata?.label).toBe("B");
        }),
        60_000,
      );

      it(
        "applies filter",
        withQdrantContainer(async (qdrant) => {
          const store = createQdrantStore({
            url: qdrant.url,
            collectionName: "test-multi-filter",
            vectors: { primary: { size: 3 }, secondary: { size: 3 } },
          });

          await store.upsert({
            id: "point-a",
            vectors: { primary: [1, 0, 0], secondary: [1, 0, 0] },
            metadata: { category: "x" },
          });
          await store.upsert({
            id: "point-b",
            vectors: { primary: [0.9, 0.1, 0], secondary: [0.9, 0.1, 0] },
            metadata: { category: "y" },
          });

          const results = await store.search({
            query: {
              type: "multi",
              prefetch: [
                { vector: [1, 0, 0], using: "primary", limit: 10 },
                { vector: [1, 0, 0], using: "secondary", limit: 10 },
              ],
              fusion: { type: "rrf" },
            },
            filter: [{ key: "category", match: "y" }],
            limit: 10,
          });

          expect(results.items).toHaveLength(1);
          expect(results.items[0].metadata?.category).toBe("y");
        }),
        60_000,
      );

      it(
        "throws when prefetch limit < limit + offset",
        withQdrantContainer(async (qdrant) => {
          const store = createQdrantStore({
            url: qdrant.url,
            collectionName: "test-limit-validation",
            vectors: { primary: { size: 3 }, secondary: { size: 3 } },
          });

          await expect(
            store.search({
              query: {
                type: "multi",
                prefetch: [
                  { vector: [1, 0, 0], using: "primary", limit: 5 },
                  { vector: [1, 0, 0], using: "secondary", limit: 8 },
                ],
                fusion: { type: "rrf" },
              },
              limit: 10,
            }),
          ).rejects.toThrow(/Prefetch limits .* must be >= limit \+ offset/);
        }),
        60_000,
      );

      it(
        "paginates results",
        withQdrantContainer(async (qdrant) => {
          const store = createQdrantStore({
            url: qdrant.url,
            collectionName: "test-multi-pagination",
            vectors: { primary: { size: 3 }, secondary: { size: 3 } },
          });

          await Promise.all([
            store.upsert({
              id: "point-1",
              vectors: { primary: [1, 0, 0], secondary: [1, 0, 0] },
            }),
            store.upsert({
              id: "point-2",
              vectors: { primary: [0.9, 0.1, 0], secondary: [0.9, 0.1, 0] },
            }),
            store.upsert({
              id: "point-3",
              vectors: { primary: [0.8, 0.2, 0], secondary: [0.8, 0.2, 0] },
            }),
          ]);

          const page1 = await store.search({
            query: {
              type: "multi",
              prefetch: [
                { vector: [1, 0, 0], using: "primary", limit: 10 },
                { vector: [1, 0, 0], using: "secondary", limit: 10 },
              ],
              fusion: { type: "rrf" },
            },
            limit: 2,
          });
          expect(page1.items).toHaveLength(2);
          expect(page1.nextOffset).toBe(2);

          const page2 = await store.search({
            query: {
              type: "multi",
              prefetch: [
                { vector: [1, 0, 0], using: "primary", limit: 10 },
                { vector: [1, 0, 0], using: "secondary", limit: 10 },
              ],
              fusion: { type: "rrf" },
            },
            limit: 2,
            offset: page1.nextOffset as number,
          });
          expect(page2.items).toHaveLength(1);
          expect(page2.nextOffset).toBeNull();

          const allIds = [...page1.items, ...page2.items].map((i) => i.id);
          expect(new Set(allIds).size).toBe(3);
        }),
        60_000,
      );
    });

    describe("metadata", () => {
      it(
        "finds by filter",
        withQdrantContainer(async (qdrant) => {
          const store = createQdrantStore({
            url: qdrant.url,
            collectionName: "test-metadata-filter",
            vectors: { [VECTOR_NAME]: { size: 3 } },
          });

          await store.upsert({
            id: "point-1",
            vectors: { [VECTOR_NAME]: [1, 0, 0] },
            metadata: { label: "first" },
          });

          const results = await store.search({
            filter: [{ key: "label", match: "first" }],
          });

          expect(results.items).toHaveLength(1);
          expect(results.items[0].metadata?.label).toBe("first");
          expect(results.items[0].score).toBe(1);
        }),
        60_000,
      );

      it(
        "paginates using PointId offset",
        withQdrantContainer(async (qdrant) => {
          const store = createQdrantStore({
            url: qdrant.url,
            collectionName: "test-metadata-pagination",
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

          const allIds = [...page1.items, ...page2.items].map((i) => i.id);
          expect(new Set(allIds).size).toBe(3);
        }),
        60_000,
      );

      it.each([
        { direction: "asc" as const, expected: [100, 200, 300] },
        { direction: "desc" as const, expected: [300, 200, 100] },
      ])(
        "orders by payload field $direction",
        async ({ direction, expected }) => {
          await withQdrantContainer(async (qdrant) => {
            const store = createQdrantStore({
              url: qdrant.url,
              collectionName: `test-orderby-${direction}`,
              vectors: { [VECTOR_NAME]: { size: 3 } },
              payloadIndexes: [{ field: "createdAt", type: "integer" }],
            });

            await store.upsert({
              id: "point-1",
              vectors: { [VECTOR_NAME]: [1, 0, 0] },
              metadata: { createdAt: 200 },
            });
            await store.upsert({
              id: "point-2",
              vectors: { [VECTOR_NAME]: [0, 1, 0] },
              metadata: { createdAt: 100 },
            });
            await store.upsert({
              id: "point-3",
              vectors: { [VECTOR_NAME]: [0, 0, 1] },
              metadata: { createdAt: 300 },
            });

            const results = await store.search({
              filter: [],
              orderBy: { key: "createdAt", direction },
            });

            expect(results.items.map((i) => i.metadata?.createdAt)).toEqual(
              expected,
            );
          })();
        },
        60_000,
      );

      it.each([
        { direction: "desc" as const, firstPage: [300, 200], lastItem: 100 },
        { direction: "asc" as const, firstPage: [100, 200], lastItem: 300 },
      ])(
        "paginates with orderBy $direction",
        async ({ direction, firstPage, lastItem }) => {
          await withQdrantContainer(async (qdrant) => {
            const store = createQdrantStore({
              url: qdrant.url,
              collectionName: `test-orderby-pagination-${direction}`,
              vectors: { [VECTOR_NAME]: { size: 3 } },
              payloadIndexes: [{ field: "createdAt", type: "integer" }],
            });

            await store.upsert({
              id: "point-1",
              vectors: { [VECTOR_NAME]: [1, 0, 0] },
              metadata: { createdAt: 300 },
            });
            await store.upsert({
              id: "point-2",
              vectors: { [VECTOR_NAME]: [0, 1, 0] },
              metadata: { createdAt: 200 },
            });
            await store.upsert({
              id: "point-3",
              vectors: { [VECTOR_NAME]: [0, 0, 1] },
              metadata: { createdAt: 100 },
            });

            const page1 = await store.search({
              filter: [],
              limit: 2,
              orderBy: { key: "createdAt", direction },
            });
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
  });
});
