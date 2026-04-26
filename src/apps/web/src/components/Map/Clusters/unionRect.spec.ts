import { describe, expect, it } from "vitest";
import { unionRect } from "./unionRect.ts";

describe("unionRect", () => {
  it("should return a rect equivalent to the input when given a single rect", () => {
    const rect = { top: 10, left: 20, right: 30, bottom: 40 };

    expect(unionRect([rect])).toEqual({
      top: 10,
      left: 20,
      right: 30,
      bottom: 40,
      x: 20,
      y: 10,
      width: 10,
      height: 30,
    });
  });

  it("should cover both rects when they don't overlap", () => {
    const dot = { top: 0, left: 0, right: 10, bottom: 10 };
    const label = { top: 20, left: 5, right: 25, bottom: 30 };

    expect(unionRect([dot, label])).toEqual({
      top: 0,
      left: 0,
      right: 25,
      bottom: 30,
      x: 0,
      y: 0,
      width: 25,
      height: 30,
    });
  });
});
