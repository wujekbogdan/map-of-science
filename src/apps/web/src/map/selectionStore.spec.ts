import { beforeEach, describe, expect, it } from "vitest";
import { useSelectionStore } from "./selectionStore.ts";

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
});
