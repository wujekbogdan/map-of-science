import { describe, expect, it } from "vitest";
import { formatScore } from "./formatScore.ts";

describe("formatScore", () => {
  it.each([
    { value: 0, formatted: "0.00" },
    { value: 1, formatted: "1.00" },
    { value: 0.65, formatted: "0.65" },
    { value: 0.823, formatted: "0.82" },
    { value: 0.829, formatted: "0.83" },
  ])("should format $value as $formatted", ({ value, formatted }) => {
    expect(formatScore(value)).toBe(formatted);
  });
});
