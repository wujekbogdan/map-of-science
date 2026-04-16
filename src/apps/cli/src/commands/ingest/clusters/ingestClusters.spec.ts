import { describe, expect, it, vi } from "vitest";
import type { AtlasStore } from "@map-of-science/atlas-store";
import { ingestClusters } from "./ingestClusters.js";

const vector = Array.from({ length: 768 }, () => 0);

const record = (id: string) => ({ id, totalArticles: 1, titles: ["t"] });

const stream = <T>(items: T[]): AsyncIterable<T> => ({
  async *[Symbol.asyncIterator]() {
    await Promise.resolve();
    for (const item of items) yield item;
  },
});

const buildDeps = (
  { collectionExists }: { collectionExists: boolean } = {
    collectionExists: false,
  },
) => {
  const createSchema = collectionExists
    ? vi.fn().mockRejectedValueOnce(new Error("Collection already exists"))
    : vi.fn().mockResolvedValueOnce(undefined);
  const clustersRepo = {
    createSchema,
    upsert: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn(),
    findByIds: vi.fn(),
    findInViewport: vi.fn(),
    findByVector: vi.fn(),
  } satisfies AtlasStore["clusters"];
  return {
    clustersRepo,
    embedCluster: vi.fn().mockResolvedValue({ vector }),
  };
};

const buildFake = (externalId: string) => ({
  id: `id-${externalId}`,
  externalId: Number(externalId),
  position: { x: 0, y: 0 },
  name: null,
  nameSource: null,
  articlesCount: 0,
  growthRating: 0,
  embedding: { model: "m", source: "s" },
  keyConcepts: [],
  vector,
});

describe("ingestClusters", () => {
  it("should abort when createSchema rejects (collection already exists)", async () => {
    const deps = buildDeps({ collectionExists: true });
    await expect(
      ingestClusters({
        ...deps,
        buildCluster: () => null,
        streamEto: stream([]),
        batchSize: 10,
      }),
    ).rejects.toThrow(/already exists/);
    expect(deps.clustersRepo.upsert).not.toHaveBeenCalled();
  });

  it("should stream records, embed titles, and upsert in batches", async () => {
    const deps = buildDeps();
    const result = await ingestClusters({
      ...deps,
      buildCluster: ({ externalId }) => buildFake(externalId),
      streamEto: stream([record("1"), record("2"), record("3")]),
      batchSize: 2,
    });

    expect(deps.clustersRepo.createSchema).toHaveBeenCalledTimes(1);
    expect(deps.embedCluster).toHaveBeenCalledTimes(3);
    expect(deps.clustersRepo.upsert).toHaveBeenCalledTimes(2);
    expect(deps.clustersRepo.upsert.mock.calls[0][0]).toHaveLength(2);
    expect(deps.clustersRepo.upsert.mock.calls[1][0]).toHaveLength(1);
    expect(result).toEqual({ count: 3 });
  });

  it("should skip records that buildCluster cannot resolve", async () => {
    const deps = buildDeps();
    const result = await ingestClusters({
      ...deps,
      buildCluster: ({ externalId }) =>
        externalId === "2" ? null : buildFake(externalId),
      streamEto: stream([record("1"), record("2"), record("3")]),
      batchSize: 10,
    });

    expect(result).toEqual({ count: 2 });
    expect(deps.clustersRepo.upsert.mock.calls[0][0]).toHaveLength(2);
  });
});
