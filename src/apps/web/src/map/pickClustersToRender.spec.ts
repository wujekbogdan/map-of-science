import { describe, expect, it } from "vitest";
import { pickClustersToRender } from "./pickClustersToRender.ts";

const make = (id: string) => ({ id, label: `c-${id}` });

describe("pickClustersToRender", () => {
  it("should return viewport clusters when nothing is selected", () => {
    const viewport = [make("a"), make("b")];
    expect(pickClustersToRender(viewport, [])).toEqual(viewport);
  });

  it("should return only selected clusters when a selection is active", () => {
    const viewport = [make("a"), make("b"), make("c")];
    const selected = [make("b")];
    expect(pickClustersToRender(viewport, selected)).toEqual(selected);
  });

  it("should ignore the viewport entirely when a selection is active", () => {
    const viewport = [make("a")];
    const selected = [make("x"), make("y")];
    expect(pickClustersToRender(viewport, selected)).toEqual(selected);
  });
});
