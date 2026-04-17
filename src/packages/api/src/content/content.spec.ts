import { describe, expect, it, vi } from "vitest";
import type { Search } from "@map-of-science/atlas";
import type { AtlasStore } from "@map-of-science/atlas-store";
import { createInnerContext } from "../context.js";
import { createCaller } from "../router.js";

const buildContentItem = () =>
  ({
    id: "content-1",
    type: "youtube-segment" as const,
    title: "Intro to Quantum Computing",
    url: "https://www.youtube.com/watch?v=abc123&t=42s",
    metadata: {
      videoId: "abc123",
      segmentUrl: "https://www.youtube.com/watch?v=abc123&t=42s",
      segmentName: "Qubits explained",
      date: "2026-01-15",
    },
    entityRefs: [{ type: "cluster" as const, id: "c-1" }],
  }) as const;

const buildAtlas = (overrides?: Partial<AtlasStore["content"]>): AtlasStore =>
  ({
    content: {
      findByClusterId: vi.fn().mockResolvedValue([buildContentItem()]),
      findByAreaId: vi.fn().mockResolvedValue([buildContentItem()]),
      ...overrides,
    },
  }) as unknown as AtlasStore;

const emptySearch = {} as Search;

const caller = (atlas: AtlasStore = buildAtlas()) =>
  createCaller(
    createInnerContext({ lang: "en_US", atlas, search: emptySearch }),
  );

describe("content.byCluster", () => {
  it("should return content items linked to the given cluster", async () => {
    const result = await caller().content.byCluster({ clusterId: "c-1" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("content-1");
  });

  it("should forward the cluster id to findByClusterId", async () => {
    const findByClusterId = vi.fn().mockResolvedValue([]);
    const atlas = buildAtlas({ findByClusterId });

    await caller(atlas).content.byCluster({ clusterId: "c-42" });

    expect(findByClusterId).toHaveBeenNthCalledWith(1, "c-42");
  });
});

describe("content.byArea", () => {
  it("should return content items linked to the given area", async () => {
    const result = await caller().content.byArea({ areaId: "a-1" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("content-1");
  });

  it("should forward the area id to findByAreaId", async () => {
    const findByAreaId = vi.fn().mockResolvedValue([]);
    const atlas = buildAtlas({ findByAreaId });

    await caller(atlas).content.byArea({ areaId: "a-42" });

    expect(findByAreaId).toHaveBeenNthCalledWith(1, "a-42");
  });
});
