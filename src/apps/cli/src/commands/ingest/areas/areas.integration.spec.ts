import { QdrantClient } from "@qdrant/js-client-rest";
import { writeFile } from "node:fs/promises";
import { dir as tmpDir } from "tmp-promise";
import { describe, expect, it, vi } from "vitest";
import { withQdrantContainer } from "@map-of-science/vector-store/test";
import { toTsv } from "../../../__test__/tsv.js";
import { runIngestAreas } from "./command.js";

const ID_1 = "550e8400-e29b-41d4-a716-446655440001";
const ID_2 = "550e8400-e29b-41d4-a716-446655440002";

const areasTsv = toTsv([
  ["id", "x", "y", "level", "cluster_id"],
  [ID_1, 10.5, -5.25, 1, "null"],
  [ID_2, 3, 4, 2, "null"],
]);

const i18nTsv = toTsv([
  ["id", "pl-PL", "en-US"],
  [ID_1, "A1pl", "A1en"],
  [ID_2, "A2pl", "A2en"],
]);

type Fixtures = { areas: string; i18n: string };

const withFixtures = async (test: (fixtures: Fixtures) => Promise<void>) => {
  const dir = await tmpDir({ unsafeCleanup: true });
  try {
    const areas = `${dir.path}/areas.tsv`;
    const i18n = `${dir.path}/i18n.tsv`;
    await Promise.all([writeFile(areas, areasTsv), writeFile(i18n, i18nTsv)]);
    expect.hasAssertions();
    await test({ areas, i18n });
  } finally {
    await dir.cleanup();
  }
};

describe("ingest:areas e2e", () => {
  it(
    "should ingest areas into a fresh Qdrant instance",
    withQdrantContainer(async (qdrant) => {
      vi.stubEnv("QDRANT_URL", qdrant.url);
      vi.stubEnv("QDRANT_API_KEY", "");

      await withFixtures(async ({ areas, i18n }) => {
        await runIngestAreas({ areas, i18n });

        const client = new QdrantClient({ url: qdrant.url });
        const { count } = await client.count("areas", { exact: true });
        expect(count).toBe(2);

        const { points } = await client.scroll("areas", {
          limit: 10,
          with_payload: true,
          with_vector: false,
        });
        const byId = new Map(
          points.map((p) => [
            p.id as string,
            p.payload as Record<string, unknown>,
          ]),
        );
        expect(byId.get(ID_1)).toEqual({
          externalId: ID_1,
          x: 10.5,
          y: -5.25,
          tier: 1,
          name: { en_US: "A1en", pl_PL: "A1pl" },
        });
      });
    }),
  );
});
