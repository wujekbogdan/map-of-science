import { describe, expect, it } from "vitest";
import {
  MIN_SCORE_DEFAULT,
  parseMinScore,
  serializeMinScore,
} from "./filter.ts";

describe("minScore filter", () => {
  it("should parse minScore from route params", () => {
    expect(parseMinScore({ minScore: 0.8 })).toBe(0.8);
  });

  it("should fall back to the default when minScore is absent", () => {
    expect(parseMinScore({})).toBe(MIN_SCORE_DEFAULT);
  });

  it("should serialize a non-default value into the URL slice", () => {
    expect(serializeMinScore(0.8)).toEqual({ minScore: 0.8 });
  });

  it("should omit minScore from the URL when at default", () => {
    expect(serializeMinScore(MIN_SCORE_DEFAULT)).toEqual({
      minScore: undefined,
    });
  });
});
