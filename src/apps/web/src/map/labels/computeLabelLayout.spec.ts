import { describe, expect, it } from "vitest";
import { computeLabelLayout } from "./computeLabelLayout.ts";

const monospace = (text: string) => text.length * 6;

describe("computeLabelLayout", () => {
  it("should keep a short name on a single line", () => {
    const layout = computeLabelLayout({
      text: "Paris",
      budgetPx: 140,
      measureText: monospace,
    });

    expect(layout.lines).toEqual(["Paris"]);
  });

  it("should wrap a long name at word boundaries when line one overflows", () => {
    // "Fundamental research" at 6px/char = 120 (fits)
    // "Fundamental research in" = 138 (fits)
    // "Fundamental research in quantum" = 186 (overflows 140)
    const layout = computeLabelLayout({
      text: "Fundamental research in quantum electrodynamics",
      budgetPx: 140,
      measureText: monospace,
    });

    expect(layout.lines).toEqual([
      "Fundamental research in",
      "quantum electrodynamics",
    ]);
  });

  it("should keep an oversized word on its own line without breaking it", () => {
    // single 34-char word = 204px, exceeds budget of 140
    const layout = computeLabelLayout({
      text: "supercalifragilisticexpialidocious",
      budgetPx: 140,
      measureText: monospace,
    });

    expect(layout.lines).toEqual(["supercalifragilisticexpialidocious"]);
  });

  it("should wrap across as many lines as needed without a cap", () => {
    // narrow budget forces many short lines
    const layout = computeLabelLayout({
      text: "alpha beta gamma delta epsilon zeta eta theta iota kappa",
      budgetPx: 40,
      measureText: monospace,
    });

    expect(layout.lines.length).toBeGreaterThan(4);
    expect(layout.lines.every((line) => line.length > 0)).toBe(true);
  });

  it("should report the widest line's measured width at the reference font", () => {
    const layout = computeLabelLayout({
      text: "short longerword",
      budgetPx: 70,
      measureText: monospace,
    });

    expect(layout.lines).toEqual(["short", "longerword"]);
    expect(layout.widthAtRefFont).toBe(monospace("longerword"));
  });

  it("should scale height with the line count, reference font, and line height", () => {
    const twoLine = computeLabelLayout({
      text: "short longerword",
      budgetPx: 70,
      measureText: monospace,
    });
    const oneLine = computeLabelLayout({
      text: "short",
      budgetPx: 100,
      measureText: monospace,
    });

    expect(twoLine.heightAtRefFont).toBeGreaterThan(0);
    expect(twoLine.heightAtRefFont).toBe(2 * oneLine.heightAtRefFont);
  });
});
