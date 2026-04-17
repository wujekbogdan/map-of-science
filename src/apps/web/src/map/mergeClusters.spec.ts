import { describe, expect, it } from "vitest";
import { mergeClustersById } from "./mergeClusters.ts";

const make = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  label: `c-${id}`,
  ...extra,
});

describe("mergeClustersById", () => {
  it("should return viewport clusters unchanged when selection is empty", () => {
    const viewport = [make("a"), make("b")];
    expect(mergeClustersById(viewport, [])).toEqual(viewport);
  });

  it("should append selected clusters that are missing from the viewport", () => {
    const viewport = [make("a")];
    const selection = [make("b"), make("c")];
    const merged = mergeClustersById(viewport, selection);
    expect(merged.map((cluster) => cluster.id)).toEqual(["a", "b", "c"]);
  });

  it("should keep the viewport entry when the same id is selected", () => {
    const viewportEntry = make("a", { source: "viewport" });
    const selectedEntry = make("a", { source: "selection" });
    const merged = mergeClustersById([viewportEntry], [selectedEntry]);
    expect(merged).toEqual([viewportEntry]);
  });
});
