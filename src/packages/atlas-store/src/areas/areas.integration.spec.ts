import { QdrantClient } from "@qdrant/js-client-rest";
import { describe, expect, it, vi } from "vitest";
import type { Area } from "@map-of-science/atlas";
// TODO: inline the Qdrant testcontainers helper here and drop the
// vector-store devDep once no other consumer remains.
import { withQdrantContainer } from "@map-of-science/vector-store/test";
import { ensureCollectionSchema } from "../collection/ensure-collection-schema.js";
import { createAreasRepository } from "./areas.js";

vi.mock("../collection/ensure-collection-schema.js", async () => {
  const actual = await vi.importActual<
    typeof import("../collection/ensure-collection-schema.js")
  >("../collection/ensure-collection-schema.js");
  return {
    ...actual,
    ensureCollectionSchema: vi.fn(actual.ensureCollectionSchema),
  };
});

type Deps = {
  repository: ReturnType<typeof createAreasRepository>;
  client: QdrantClient;
};

const withAreasRepository = (test: (deps: Deps) => Promise<void>) =>
  withQdrantContainer(async (qdrant) => {
    const client = new QdrantClient({ url: qdrant.url });
    const repository = createAreasRepository({ qdrant: client });
    await test({ repository, client });
  });

const withReadyAreasRepository = (test: (deps: Deps) => Promise<void>) =>
  withAreasRepository(async (deps) => {
    await deps.repository.ensureSchema();
    await test(deps);
  });

const buildArea = (overrides: Partial<Area> = {}): Area => ({
  id: "550e8400-e29b-41d4-a716-446655440100",
  externalId: "eto-area-100",
  position: { x: 12.5, y: -8.25 },
  tier: 1,
  name: { en_US: "Physics", pl_PL: "Fizyka" },
  ...overrides,
});

describe("areas repository", () => {
  it(
    "should ensure the areas schema",
    withAreasRepository(async ({ repository }) => {
      vi.mocked(ensureCollectionSchema).mockClear();

      await repository.ensureSchema();

      expect(ensureCollectionSchema).toHaveBeenCalledTimes(1);
      expect(ensureCollectionSchema).toHaveBeenNthCalledWith(
        1,
        expect.any(QdrantClient),
        {
          name: "areas",
          vectors: {
            _placeholder: { size: 1, distance: "Cosine" },
          },
          payloadIndexes: [
            { field_name: "x", field_schema: "float" },
            { field_name: "y", field_schema: "float" },
            { field_name: "tier", field_schema: "integer" },
          ],
        },
      );
    }),
    60_000,
  );

  it(
    "should save an area and read it back by id",
    withReadyAreasRepository(async ({ repository }) => {
      const area = buildArea();
      await repository.upsert([area]);

      const found = await repository.findById(area.id);
      expect(found).toEqual(area);
    }),
    60_000,
  );

  it(
    "should return null when the area is not found",
    withReadyAreasRepository(async ({ repository }) => {
      const found = await repository.findById(
        "550e8400-e29b-41d4-a716-446655440199",
      );
      expect(found).toBeNull();
    }),
    60_000,
  );

  it(
    "should return only areas whose position falls inside the bbox",
    withReadyAreasRepository(async ({ repository }) => {
      const inside = buildArea({
        id: "550e8400-e29b-41d4-a716-446655440110",
        externalId: "eto-area-110",
        position: { x: 5, y: 5 },
      });
      const outside = buildArea({
        id: "550e8400-e29b-41d4-a716-446655440111",
        externalId: "eto-area-111",
        position: { x: 50, y: 5 },
      });
      await repository.upsert([inside, outside]);

      const found = await repository.findInViewport({
        bbox: { x: { min: 0, max: 10 }, y: { min: 0, max: 10 } },
      });

      expect(found.map((area) => area.externalId)).toEqual(["eto-area-110"]);
    }),
    60_000,
  );

  it(
    "should return areas from all tiers when no tier is specified",
    withReadyAreasRepository(async ({ repository }) => {
      const tier1 = buildArea({
        id: "550e8400-e29b-41d4-a716-446655440120",
        externalId: "eto-area-120",
        position: { x: 1, y: 1 },
        tier: 1,
      });
      const tier2 = buildArea({
        id: "550e8400-e29b-41d4-a716-446655440121",
        externalId: "eto-area-121",
        position: { x: 2, y: 2 },
        tier: 2,
      });
      await repository.upsert([tier1, tier2]);

      const found = await repository.findInViewport({
        bbox: { x: { min: 0, max: 10 }, y: { min: 0, max: 10 } },
      });

      expect(found).toHaveLength(2);
    }),
    60_000,
  );

  it(
    "should return only areas matching the tier filter when specified",
    withReadyAreasRepository(async ({ repository }) => {
      const tier1 = buildArea({
        id: "550e8400-e29b-41d4-a716-446655440130",
        externalId: "eto-area-130",
        position: { x: 1, y: 1 },
        tier: 1,
      });
      const tier2 = buildArea({
        id: "550e8400-e29b-41d4-a716-446655440131",
        externalId: "eto-area-131",
        position: { x: 2, y: 2 },
        tier: 2,
      });
      await repository.upsert([tier1, tier2]);

      const found = await repository.findInViewport({
        bbox: { x: { min: 0, max: 10 }, y: { min: 0, max: 10 } },
        tier: 2,
      });

      expect(found.map((area) => area.externalId)).toEqual(["eto-area-131"]);
    }),
    60_000,
  );
});
