import { describe, expect, it } from "vitest";
import {
  computeZoomToFit,
  getBoundingBox,
  getCenteredBoundingBox,
} from "./viewport.ts";

describe("getCenteredBoundingBox", () => {
  it("should center the box on the point with map-sized half extents", () => {
    const bbox = getCenteredBoundingBox(
      { x: 10, y: 20 },
      { width: 100, height: 50 },
    );
    expect(bbox).toEqual({
      min: { x: -40, y: -5 },
      max: { x: 60, y: 45 },
      center: { x: 10, y: 20 },
    });
  });
});

describe("getBoundingBox", () => {
  it("should fall back to centered box for a single point", () => {
    expect(getBoundingBox([{ x: 5, y: 5 }], { width: 20, height: 10 })).toEqual(
      {
        min: { x: -5, y: 0 },
        max: { x: 15, y: 10 },
        center: { x: 5, y: 5 },
      },
    );
  });

  it("should compute a 10% padded bbox around multiple points", () => {
    const bbox = getBoundingBox(
      [
        { x: 0, y: 0 },
        { x: 100, y: 50 },
      ],
      { width: 200, height: 100 },
    );
    expect(bbox).toEqual({
      min: { x: -10, y: -5 },
      max: { x: 110, y: 55 },
      center: { x: 50, y: 25 },
    });
  });
});

describe("computeZoomToFit", () => {
  it("should pick the smaller of x / y scales so the box fits in the map", () => {
    const zoom = computeZoomToFit(
      {
        min: { x: 0, y: 0 },
        max: { x: 100, y: 100 },
        center: { x: 50, y: 50 },
      },
      { width: 200, height: 500 },
    );
    expect(zoom).toEqual({
      x: -50 * 2 + 100,
      y: -50 * 2 + 250,
      scale: 2,
    });
  });
});
