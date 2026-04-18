import { describe, expect, it, vi } from "vitest";
import type { Search } from "@map-of-science/atlas";
import type { AtlasStore } from "@map-of-science/atlas-store";
import { createInnerContext, type Lang } from "../context.js";
import { createCaller } from "../router.js";

const buildArea = () => ({
  id: "a-1",
  externalId: "eto-area-1",
  position: { x: 10, y: -5 },
  tier: 2,
  name: { en_US: "Physics", pl_PL: "Fizyka" },
});

const buildAtlas = (overrides?: Partial<AtlasStore["areas"]>): AtlasStore =>
  ({
    areas: {
      findById: vi.fn().mockResolvedValue(buildArea()),
      findInViewport: vi.fn().mockResolvedValue([buildArea()]),
      ...overrides,
    },
  }) as unknown as AtlasStore;

const emptySearch = {} as Search;

const callerFor = (lang: Lang, atlas: AtlasStore = buildAtlas()) =>
  createCaller(createInnerContext({ lang, atlas, search: emptySearch }));

describe("area.byId", () => {
  it.each([
    ["en_US", "Physics"],
    ["pl_PL", "Fizyka"],
  ] as const)("should flatten the area name to %s", async (lang, expected) => {
    const result = await callerFor(lang).area.byId({ id: "a-1" });
    expect(result?.name).toBe(expected);
  });

  it("should return null when the area is not found", async () => {
    const atlas = buildAtlas({
      findById: vi.fn().mockResolvedValue(null),
    });

    const result = await callerFor("en_US", atlas).area.byId({ id: "missing" });

    expect(result).toBeNull();
  });
});

describe("area.viewport", () => {
  const bbox = { x: { min: 0, max: 10 }, y: { min: 0, max: 10 } };

  it("should localize every area in the viewport result", async () => {
    const result = await callerFor("pl_PL").area.viewport({ bbox });
    expect(result[0].name).toBe("Fizyka");
  });

  it("should forward a tier filter when provided", async () => {
    const findInViewport = vi.fn().mockResolvedValue([]);
    const atlas = buildAtlas({ findInViewport });

    await callerFor("en_US", atlas).area.viewport({ bbox, tier: 2 });

    expect(findInViewport).toHaveBeenNthCalledWith(1, { bbox, tier: 2 });
  });

  it("should omit the tier filter when not provided", async () => {
    const findInViewport = vi.fn().mockResolvedValue([]);
    const atlas = buildAtlas({ findInViewport });

    await callerFor("en_US", atlas).area.viewport({ bbox });

    expect(findInViewport).toHaveBeenNthCalledWith(1, { bbox });
  });
});
