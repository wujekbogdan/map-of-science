import { describe, expect, it, vi } from "vitest";
import type { AtlasStore } from "@map-of-science/atlas-store";
import { ingestAreas } from "./ingestAreas.js";

const areaRow = {
  id: "a-1",
  x: "1",
  y: "2",
  level: "1",
  cluster_id: "null",
};

const i18nRow = { id: "a-1", "pl-PL": "P", "en-US": "E" };

const buildDeps = (
  { collectionExists }: { collectionExists: boolean } = {
    collectionExists: false,
  },
) => {
  const createSchema = collectionExists
    ? vi.fn().mockRejectedValueOnce(new Error("Collection already exists"))
    : vi.fn().mockResolvedValueOnce(undefined);
  const areasRepo = {
    createSchema,
    upsert: vi.fn().mockResolvedValueOnce(undefined),
    findById: vi.fn(),
    findInViewport: vi.fn(),
  } satisfies AtlasStore["areas"];
  return {
    areasRepo,
    readAreas: vi.fn().mockResolvedValueOnce([areaRow]),
    readI18n: vi.fn().mockResolvedValueOnce([i18nRow]),
  };
};

describe("ingestAreas", () => {
  it("should create schema and upsert joined areas", async () => {
    const deps = buildDeps();
    const result = await ingestAreas(deps);

    expect(deps.areasRepo.createSchema).toHaveBeenCalledTimes(1);
    expect(deps.areasRepo.upsert).toHaveBeenNthCalledWith(1, [
      {
        id: "a-1",
        externalId: "a-1",
        position: { x: 1, y: 2 },
        tier: 1,
        name: { en_US: "E", pl_PL: "P" },
      },
    ]);
    expect(result).toEqual({ count: 1 });
  });

  it("should abort when createSchema rejects (collection already exists)", async () => {
    const deps = buildDeps({ collectionExists: true });
    await expect(ingestAreas(deps)).rejects.toThrow(/already exists/);
    expect(deps.areasRepo.upsert).not.toHaveBeenCalled();
  });
});
