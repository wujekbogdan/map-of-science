import { zoomIdentity } from "d3";
import { describe, expect, it } from "vitest";
import { REF_FONT_SIZE } from "./config.ts";
import { labelBbox } from "./labelBbox.ts";

describe("labelBbox", () => {
  it("should center the rectangle on the screen anchor lifted by the offset", () => {
    const bbox = labelBbox({
      cluster: { position: { x: 0, y: 0 } },
      layout: { lines: ["a"], widthAtRefFont: 40, heightAtRefFont: 20 },
      transform: zoomIdentity,
      fontSize: REF_FONT_SIZE,
      offset: 15,
    });

    // identity transform: screen anchor = (0, 0), lifted to (0, -15).
    // REF font size → no scaling. Width 40 / 2 = 20 each side.
    // Height 20 / 2 = 10 each side of anchor.
    expect(bbox).toEqual({ minX: -20, minY: -25, maxX: 20, maxY: -5 });
  });

  it("should project the cluster position through the zoom transform", () => {
    // transform.apply(x, y) = (x * k + tx, y * k + ty) = (50, 110) for (20, 40) with scale 2, translate 10/30.
    const bbox = labelBbox({
      cluster: { position: { x: 20, y: 40 } },
      layout: { lines: ["a"], widthAtRefFont: 40, heightAtRefFont: 20 },
      transform: zoomIdentity.translate(10, 30).scale(2),
      fontSize: REF_FONT_SIZE,
      offset: 15,
    });

    // screen anchor = (50, 110), lifted to (50, 95).
    expect(bbox).toEqual({ minX: 30, minY: 85, maxX: 70, maxY: 105 });
  });

  it("should scale layout dimensions by fontSize relative to the reference font", () => {
    // fontSize = 2 * REF → width and height both doubled relative to layout values.
    const bbox = labelBbox({
      cluster: { position: { x: 0, y: 0 } },
      layout: { lines: ["a"], widthAtRefFont: 40, heightAtRefFont: 20 },
      transform: zoomIdentity,
      fontSize: REF_FONT_SIZE * 2,
      offset: 0,
    });

    // width = 80 → ±40, height = 40 → ±20
    expect(bbox).toEqual({ minX: -40, minY: -20, maxX: 40, maxY: 20 });
  });
});
