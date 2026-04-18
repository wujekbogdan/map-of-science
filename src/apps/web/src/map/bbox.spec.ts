import { zoomIdentity } from "d3";
import { describe, expect, it } from "vitest";
import { transformToBbox } from "./bbox.ts";

const size = { width: 100, height: 200 };

describe("transformToBbox", () => {
  it("should return viewport extents unchanged for identity transform", () => {
    expect(transformToBbox(zoomIdentity, size)).toEqual({
      x: { min: 0, max: 100 },
      y: { min: 0, max: 200 },
    });
  });

  it("should shrink world bbox when zoomed in", () => {
    const scaled = zoomIdentity.scale(2);
    expect(transformToBbox(scaled, size)).toEqual({
      x: { min: 0, max: 50 },
      y: { min: 0, max: 100 },
    });
  });

  it("should shift world bbox when translated", () => {
    const translated = zoomIdentity.translate(-30, -60);
    expect(transformToBbox(translated, size)).toEqual({
      x: { min: 30, max: 130 },
      y: { min: 60, max: 260 },
    });
  });
});
