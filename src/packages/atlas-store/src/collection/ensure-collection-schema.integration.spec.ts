import { QdrantClient } from "@qdrant/js-client-rest";
import { describe, expect, it, vi } from "vitest";
import { withQdrantContainer } from "@map-of-science/test-utils";
import {
  type CollectionSchemaSpec,
  ensureCollectionSchema,
} from "./ensure-collection-schema.js";

type Deps = {
  client: QdrantClient;
};

const withQdrant = (test: (deps: Deps) => Promise<void>) =>
  withQdrantContainer(async (qdrant) => {
    const client = new QdrantClient({ url: qdrant.url });
    await test({ client });
  });

const buildSpec = (overrides: Partial<CollectionSchemaSpec> = {}) => ({
  name: "test-collection",
  vectors: {
    titles: { size: 4, distance: "Cosine" as const },
  },
  payloadIndexes: [],
  ...overrides,
});

describe("ensureCollectionSchema", () => {
  it(
    "should create the collection with the given named vectors",
    withQdrant(async ({ client }) => {
      const spec = buildSpec({
        name: "with-vectors",
        vectors: {
          titles: { size: 8, distance: "Cosine" },
          abstracts: { size: 16, distance: "Cosine" },
        },
      });

      await ensureCollectionSchema(client, spec);

      const collection = await client.getCollection("with-vectors");
      expect(collection.config.params.vectors).toMatchObject({
        titles: { size: 8, distance: "Cosine" },
        abstracts: { size: 16, distance: "Cosine" },
      });
    }),
    60_000,
  );

  it(
    "should skip creation when the collection already exists",
    withQdrant(async ({ client }) => {
      const spec = buildSpec({
        name: "already-there",
        payloadIndexes: [{ field_name: "x", field_schema: "float" }],
      });
      await ensureCollectionSchema(client, spec);

      const createCollection = vi.spyOn(client, "createCollection");
      const createPayloadIndex = vi.spyOn(client, "createPayloadIndex");

      await ensureCollectionSchema(client, spec);

      expect(createCollection).not.toHaveBeenCalled();
      expect(createPayloadIndex).not.toHaveBeenCalled();
    }),
    60_000,
  );

  it(
    "should create all payload indexes declared in the spec",
    withQdrant(async ({ client }) => {
      const spec = buildSpec({
        name: "with-indexes",
        payloadIndexes: [
          { field_name: "x", field_schema: "float" },
          { field_name: "y", field_schema: "float" },
          { field_name: "tier", field_schema: "integer" },
        ],
      });

      await ensureCollectionSchema(client, spec);

      const collection = await client.getCollection("with-indexes");
      expect(collection.payload_schema).toMatchObject({
        x: { data_type: "float" },
        y: { data_type: "float" },
        tier: { data_type: "integer" },
      });
    }),
    60_000,
  );
});
