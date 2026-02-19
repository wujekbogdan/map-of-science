import { describe, it, expect } from "vitest";
import { formatCurrency, calculatePrice } from "./index.js";

describe("formatCurrency", () => {
  it.each([
    {
      input: 0.000073,
      expected: "$0.000073",
      desc: "small amounts with 6 decimals",
    },
    { input: 1.5, expected: "$1.50", desc: "larger amounts with 2 decimals" },
    { input: 0, expected: "$0.00", desc: "zero" },
  ])("formats $desc ($input → $expected)", ({ input, expected }) => {
    expect(formatCurrency(input)).toBe(expected);
  });
});

describe("calculatePrice", () => {
  it("should calculate price for gemini-embedding-001", () => {
    const result = calculatePrice({
      model: "gemini-embedding-001",
      inputTokens: 100,
    });

    expect(result.raw).toBeGreaterThan(0);
    expect(result.formatted).toMatch(/^\$/);
    expect(typeof result.raw).toBe("number");
    expect(typeof result.formatted).toBe("string");
  });

  it("should calculate price for model with input and output tokens", () => {
    const result = calculatePrice({
      model: "gemini-2.0-flash-exp",
      inputTokens: 100,
      outputTokens: 50,
    });

    expect(result.raw).toBeGreaterThan(0);
    expect(result.formatted).toMatch(/^\$/);
  });

  it("should return zero cost for unknown model", () => {
    const result = calculatePrice({
      model: "unknown-model",
      inputTokens: 100,
    });

    expect(result.raw).toBe(0);
    expect(result.formatted).toBe("$0.00");
  });

  it("should handle undefined tokens", () => {
    const result = calculatePrice({
      model: "gemini-embedding-001",
    });

    expect(result.raw).toBe(0);
    expect(result.formatted).toBe("$0.00");
  });
});
