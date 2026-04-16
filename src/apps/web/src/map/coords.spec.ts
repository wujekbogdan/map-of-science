import { describe, expect, it } from "vitest";
import { flipPositionY, renderBboxToQdrantBbox } from "./coords.ts";

describe("flipPositionY", () => {
  it("should negate y and leave x untouched", () => {
    expect(flipPositionY({ x: 10, y: 5 })).toEqual({ x: 10, y: -5 });
  });
});

describe("renderBboxToQdrantBbox", () => {
  it("should swap and negate the y range while leaving x untouched", () => {
    expect(
      renderBboxToQdrantBbox({
        x: { min: -50, max: 100 },
        y: { min: -30, max: 70 },
      }),
    ).toEqual({
      x: { min: -50, max: 100 },
      y: { min: -70, max: 30 },
    });
  });
});
