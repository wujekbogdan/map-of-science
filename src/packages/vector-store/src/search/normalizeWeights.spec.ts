import { describe, expect, it } from "vitest";
import { normalizeWeights } from "./multiVectorSearch.js";

describe("normalizeWeights", () => {
  it.each([
    { input: [3, 1], expected: [0.75, 0.25] },
    { input: [1, 1, 1], expected: [1 / 3, 1 / 3, 1 / 3] },
    { input: [0.7, 0.3], expected: [0.7, 0.3] },
    { input: [1, 0], expected: [1, 0] },
  ])("normalizes $input to $expected", ({ input, expected }) => {
    const result = normalizeWeights(input);
    result.forEach((value, index) => {
      expect(value).toBeCloseTo(expected[index]);
    });
  });

  it("throws when all weights are zero", () => {
    expect(() => normalizeWeights([0, 0])).toThrow(
      "Weights cannot all be zero",
    );
  });
});
