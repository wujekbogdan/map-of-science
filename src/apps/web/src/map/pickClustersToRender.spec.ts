import { describe, expect, it } from "vitest";
import { pickClustersToRender } from "./pickClustersToRender.ts";

const make = (id: string) => ({ id, label: `c-${id}` });

describe("pickClustersToRender", () => {
  it("should return viewport unchanged when no clusters are highlighted", () => {
    const viewport = [make("a"), make("b")];
    expect(pickClustersToRender(viewport, [])).toEqual(viewport);
  });

  it("should keep viewport visible and merge in a single highlight already in viewport", () => {
    const a = make("a");
    const b = make("b");
    expect(pickClustersToRender([a, b], [b])).toEqual([a, b]);
  });

  it("should keep viewport visible and append a single off-viewport highlight", () => {
    const a = make("a");
    const b = make("b");
    const x = make("x");
    expect(pickClustersToRender([a, b], [x])).toEqual([a, b, x]);
  });

  it("should return only the highlight set when more than one cluster is highlighted", () => {
    const viewport = [make("a"), make("b"), make("c")];
    const highlighted = [make("b"), make("x")];
    expect(pickClustersToRender(viewport, highlighted)).toEqual(highlighted);
  });
});
