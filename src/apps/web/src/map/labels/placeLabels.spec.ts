import { describe, expect, it } from "vitest";
import { placeLabels } from "./placeLabels.ts";

describe("placeLabels", () => {
  it("should return an empty set for empty candidates", () => {
    const kept = placeLabels({ candidates: [] });

    expect(kept).toEqual(new Set());
  });

  it("should keep all candidates when no rectangles overlap", () => {
    const kept = placeLabels({
      candidates: [
        { id: "a", bbox: { minX: 0, minY: 0, maxX: 10, maxY: 10 } },
        { id: "b", bbox: { minX: 20, minY: 0, maxX: 30, maxY: 10 } },
        { id: "c", bbox: { minX: 0, minY: 20, maxX: 10, maxY: 30 } },
      ],
    });

    expect(kept).toEqual(new Set(["a", "b", "c"]));
  });

  it("should drop a lower-priority candidate that overlaps an earlier one", () => {
    const kept = placeLabels({
      candidates: [
        { id: "high", bbox: { minX: 0, minY: 0, maxX: 10, maxY: 10 } },
        { id: "low", bbox: { minX: 5, minY: 5, maxX: 15, maxY: 15 } },
      ],
    });

    expect(kept).toEqual(new Set(["high"]));
  });

  it("should drop candidates that overlap pre-placed obstacles", () => {
    const kept = placeLabels({
      candidates: [
        { id: "blocked", bbox: { minX: 0, minY: 0, maxX: 10, maxY: 10 } },
        { id: "clear", bbox: { minX: 100, minY: 100, maxX: 110, maxY: 110 } },
      ],
      obstacles: [{ minX: 0, minY: 0, maxX: 10, maxY: 10 }],
    });

    expect(kept).toEqual(new Set(["clear"]));
  });
});
