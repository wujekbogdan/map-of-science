import { beforeEach, describe, expect, it } from "vitest";
import { type SelectedCluster, useSelectionStore } from "./selectionStore.ts";

const makeCluster = (
  overrides: Partial<SelectedCluster> = {},
): SelectedCluster => ({
  id: "c-1",
  externalId: 1,
  position: { x: 0, y: 0 },
  name: "Test",
  displayName: "Test",
  nameSource: "llm",
  articlesCount: 100,
  growthRating: 50,
  embedding: { model: "test", source: "titles" },
  keyConcepts: [],
  score: 0.9,
  ...overrides,
});

describe("selectionStore", () => {
  beforeEach(() => {
    useSelectionStore.setState({
      selectedClusters: new Map(),
      searchHoveredClusterId: null,
    });
  });

  it("should set the search-hovered cluster id", () => {
    useSelectionStore.getState().setSearchHoveredCluster("c-42");
    expect(useSelectionStore.getState().searchHoveredClusterId).toBe("c-42");
  });

  it("should clear the search-hovered cluster id when set to null", () => {
    useSelectionStore.getState().setSearchHoveredCluster("c-42");
    useSelectionStore.getState().setSearchHoveredCluster(null);
    expect(useSelectionStore.getState().searchHoveredClusterId).toBeNull();
  });

  it("should swap selectedClusters when ids differ and keep the same reference when they don't", () => {
    const a = makeCluster({ id: "a" });
    const b = makeCluster({ id: "b" });

    useSelectionStore.getState().setSelectedClusters([a, b]);
    const initial = useSelectionStore.getState().selectedClusters;
    expect(initial.size).toBe(2);

    useSelectionStore.getState().setSelectedClusters([a, b]);
    expect(useSelectionStore.getState().selectedClusters).toBe(initial);

    useSelectionStore.getState().setSelectedClusters([a]);
    expect(useSelectionStore.getState().selectedClusters).not.toBe(initial);
  });
});
