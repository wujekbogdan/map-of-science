import { describe, expect, it } from "vitest";
import { mergeHighlightedClusters } from "./mergeHighlightedClusters.ts";

const make = (id: string) => ({ id, label: `c-${id}` });

describe("mergeHighlightedClusters", () => {
  it("should return selected entries when no active cluster is provided", () => {
    const a = make("a");
    const b = make("b");
    const selected = new Map([
      ["a", a],
      ["b", b],
    ]);
    expect(mergeHighlightedClusters(selected, null)).toEqual([a, b]);
  });

  it("should return just the active cluster when nothing is selected", () => {
    const a = make("a");
    expect(mergeHighlightedClusters(new Map(), a)).toEqual([a]);
  });

  it("should append the active cluster when it is not already selected", () => {
    const a = make("a");
    const b = make("b");
    const selected = new Map([["a", a]]);
    expect(mergeHighlightedClusters(selected, b)).toEqual([a, b]);
  });

  it("should not duplicate the active cluster when it is already selected", () => {
    const a = make("a");
    const selected = new Map([["a", a]]);
    expect(mergeHighlightedClusters(selected, a)).toEqual([a]);
  });

  it("should return an empty array when nothing is selected and no active cluster", () => {
    expect(mergeHighlightedClusters(new Map(), null)).toEqual([]);
  });
});
