import { describe, expect, it, vi } from "vitest";
import type { Search } from "@map-of-science/atlas";
import type { AtlasStore } from "@map-of-science/atlas-store";
import { createInnerContext, type Lang } from "../context.js";
import { createCaller } from "../router.js";

const buildCluster = () => ({
  id: "c-1",
  externalId: 1,
  position: { x: 10, y: -5 },
  name: { en_US: "Machine Learning", pl_PL: "Uczenie Maszynowe" },
  nameSource: "llm" as const,
  articlesCount: 1200,
  growthRating: 75.5,
  embedding: { model: "gemini-embedding-001", source: "article-titles" },
  keyConcepts: ["machine learning", "neural networks"],
});

const buildAtlas = (overrides?: Partial<AtlasStore["clusters"]>): AtlasStore =>
  ({
    clusters: {
      findById: vi.fn().mockResolvedValue(buildCluster()),
      ...overrides,
    },
  }) as unknown as AtlasStore;

const emptySearch = {} as Search;

const callerFor = (lang: Lang, atlas: AtlasStore = buildAtlas()) =>
  createCaller(createInnerContext({ lang, atlas, search: emptySearch }));

describe("cluster.byId", () => {
  it.each([
    ["en_US", "Machine Learning"],
    ["pl_PL", "Uczenie Maszynowe"],
  ] as const)(
    "should flatten the cluster name to %s",
    async (lang, expected) => {
      const result = await callerFor(lang).cluster.byId({ id: "c-1" });
      expect(result?.name).toBe(expected);
    },
  );

  it("should return null name when the cluster has no name", async () => {
    const atlas = buildAtlas({
      findById: vi
        .fn()
        .mockResolvedValue({ ...buildCluster(), name: null, nameSource: null }),
    });

    const result = await callerFor("en_US", atlas).cluster.byId({ id: "c-1" });

    expect(result?.name).toBeNull();
  });

  it("should include keyConcepts in the response", async () => {
    const result = await callerFor("en_US").cluster.byId({ id: "c-1" });
    expect(result?.keyConcepts).toEqual([
      "machine learning",
      "neural networks",
    ]);
  });

  it("should use the localized name as displayName", async () => {
    const result = await callerFor("en_US").cluster.byId({ id: "c-1" });
    expect(result?.displayName).toBe("Machine Learning");
  });

  it.each([
    ["en_US", "Cluster #1"],
    ["pl_PL", "Klaster #1"],
  ] as const)(
    "should display null-name cluster as a localized placeholder in %s",
    async (lang, expected) => {
      const atlas = buildAtlas({
        findById: vi.fn().mockResolvedValue({
          ...buildCluster(),
          name: null,
          nameSource: null,
        }),
      });

      const result = await callerFor(lang, atlas).cluster.byId({ id: "c-1" });

      expect(result?.displayName).toBe(expected);
    },
  );

  it("should negate position.y to convert to screen-space", async () => {
    const result = await callerFor("en_US").cluster.byId({ id: "c-1" });
    expect(result?.position).toEqual({ x: 10, y: 5 });
  });
});

describe("cluster.byIds", () => {
  it("should localize every cluster in the result", async () => {
    const first = { ...buildCluster(), id: "c-1" };
    const second = {
      ...buildCluster(),
      id: "c-2",
      name: { en_US: "Physics", pl_PL: "Fizyka" },
    };
    const atlas = buildAtlas({
      findByIds: vi.fn().mockResolvedValue([first, second]),
    });

    const result = await callerFor("pl_PL", atlas).cluster.byIds({
      ids: ["c-1", "c-2"],
    });

    expect(result.map((cluster) => cluster.name)).toEqual([
      "Uczenie Maszynowe",
      "Fizyka",
    ]);
  });
});

describe("cluster.viewport", () => {
  const bbox = { x: { min: 0, max: 10 }, y: { min: 1, max: 10 } };

  it("should localize every cluster in the viewport result", async () => {
    const atlas = buildAtlas({
      findInViewport: vi.fn().mockResolvedValue([buildCluster()]),
    });

    const result = await callerFor("pl_PL", atlas).cluster.viewport({ bbox });

    expect(result[0].name).toBe("Uczenie Maszynowe");
  });

  it("should flip bbox y from screen-space to natural before querying store", async () => {
    const findInViewport = vi.fn().mockResolvedValue([]);
    const atlas = buildAtlas({ findInViewport });
    const screenBbox = { x: { min: 0, max: 10 }, y: { min: 2, max: 8 } };

    await callerFor("en_US", atlas).cluster.viewport({ bbox: screenBbox });

    expect(findInViewport).toHaveBeenCalledTimes(1);
    expect(findInViewport).toHaveBeenNthCalledWith(1, {
      bbox: { x: { min: 0, max: 10 }, y: { min: -8, max: -2 } },
      limit: 500,
    });
  });

  it("should forward a caller-provided limit", async () => {
    const findInViewport = vi.fn().mockResolvedValue([]);
    const atlas = buildAtlas({ findInViewport });

    await callerFor("en_US", atlas).cluster.viewport({ bbox, limit: 25 });

    expect(findInViewport).toHaveBeenNthCalledWith(1, {
      bbox: { x: { min: 0, max: 10 }, y: { min: -10, max: -1 } },
      limit: 25,
    });
  });
});
