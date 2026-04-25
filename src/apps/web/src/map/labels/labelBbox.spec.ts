import { describe, expect, it } from "vitest";
import { REF_FONT_SIZE } from "./config.ts";
import { labelBbox } from "./labelBbox.ts";

describe("labelBbox", () => {
  it("should center horizontally on the anchor and hang below by the offset", () => {
    const bbox = labelBbox({
      anchor: { x: 0, y: 0 },
      layout: { lines: ["a"], widthAtRefFont: 40, heightAtRefFont: 20 },
      fontSizePx: REF_FONT_SIZE,
      offsetPx: 15,
    });

    expect(bbox).toEqual({ minX: -20, minY: 15, maxX: 20, maxY: 35 });
  });

  it("should translate the rectangle with the anchor", () => {
    const bbox = labelBbox({
      anchor: { x: 50, y: 110 },
      layout: { lines: ["a"], widthAtRefFont: 40, heightAtRefFont: 20 },
      fontSizePx: REF_FONT_SIZE,
      offsetPx: 0,
    });

    expect(bbox).toEqual({ minX: 30, minY: 110, maxX: 70, maxY: 130 });
  });

  it("should scale layout dimensions linearly with fontSizePx", () => {
    const bbox = labelBbox({
      anchor: { x: 0, y: 0 },
      layout: { lines: ["a"], widthAtRefFont: 40, heightAtRefFont: 20 },
      fontSizePx: REF_FONT_SIZE * 2,
      offsetPx: 0,
    });

    expect(bbox).toEqual({ minX: -40, minY: 0, maxX: 40, maxY: 40 });
  });

  it("should extend downward for multi-line layouts", () => {
    const bbox = labelBbox({
      anchor: { x: 0, y: 0 },
      layout: {
        lines: ["a", "b", "c"],
        widthAtRefFont: 40,
        heightAtRefFont: 60,
      },
      fontSizePx: REF_FONT_SIZE,
      offsetPx: 0,
    });

    expect(bbox).toEqual({ minX: -20, minY: 0, maxX: 20, maxY: 60 });
  });
});
