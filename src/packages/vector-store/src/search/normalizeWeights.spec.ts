import { describe, expect, it } from "vitest";
import { normalizeWeights } from "./multiVectorSearch.js";

describe("normalizeWeights", () => {
  describe("2 weights", () => {
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

    it("throws when all weights are zero", () => {
      expect(() => normalizeWeights([0, 0])).toThrow(
        "Weights cannot all be zero",
      );
    });
  });

  describe("3 weights", () => {
    it.each([
      {
        input: [3, 2, 1] as [number, number, number],
        expected: [0.5, 1 / 3, 1 / 6],
      },
      {
        input: [1, 1, 1] as [number, number, number],
        expected: [1 / 3, 1 / 3, 1 / 3],
      },
      {
        input: [1, 0, 0] as [number, number, number],
        expected: [1, 0, 0],
      },
      {
        input: [0, 1, 0] as [number, number, number],
        expected: [0, 1, 0],
      },
    ])("normalizes $input to $expected", ({ input, expected }) => {
      const result = normalizeWeights(input);
      expect(result[0]).toBeCloseTo(expected[0]);
      expect(result[1]).toBeCloseTo(expected[1]);
      expect(result[2]).toBeCloseTo(expected[2]);
    });

    it("throws when all weights are zero", () => {
      expect(() => normalizeWeights([0, 0, 0])).toThrow(
        "Weights cannot all be zero",
      );
    });
  });
});
