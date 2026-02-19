import { describe, it, expect } from "vitest";
import { invertedIndexToText } from "./invertedIndexToText.js";

describe("invertedIndexToText", () => {
  it("converts inverted index to plain text", () => {
    const index = {
      Despite: [0],
      growing: [1],
      interest: [2],
      in: [3, 7],
      machine: [4],
      learning: [5, 8],
      and: [6],
    };

    expect(invertedIndexToText(index)).toBe(
      "Despite growing interest in machine learning and in learning",
    );
  });

  it("handles single word", () => {
    expect(invertedIndexToText({ hello: [0] })).toBe("hello");
  });

  it("handles empty object", () => {
    expect(invertedIndexToText({})).toBe("");
  });
});
