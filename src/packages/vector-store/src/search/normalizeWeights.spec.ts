import { describe, expect, it } from "vitest";
import { normalizeWeights } from "./multiVectorSearch.js";

describe("normalizeWeights", () => {
  it.each([
    { input: [3, 1] as [number, number], expected: [0.75, 0.25] },
    { input: [7, 3] as [number, number], expected: [0.7, 0.3] },
    { input: [1, 1] as [number, number], expected: [0.5, 0.5] },
    { input: [0.7, 0.3] as [number, number], expected: [0.7, 0.3] },
    { input: [1, 0] as [number, number], expected: [1, 0] },
    { input: [0, 1] as [number, number], expected: [0, 1] },
  ])("normalizes $input to $expected", ({ input, expected }) => {
    const result = normalizeWeights(input);
    expect(result[0]).toBeCloseTo(expected[0]);
    expect(result[1]).toBeCloseTo(expected[1]);
  });

  it("throws when both weights are zero", () => {
    expect(() => normalizeWeights([0, 0])).toThrow(
      "Weights cannot both be zero",
    );
  });
});
