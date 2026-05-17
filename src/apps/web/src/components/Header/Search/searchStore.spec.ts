import { beforeEach, describe, expect, it } from "vitest";
import {
  MIN_QUERY_LENGTH,
  selectIsSearchActive,
  useSearchStore,
} from "./searchStore.ts";

describe("searchStore", () => {
  beforeEach(() => {
    useSearchStore.setState({ draftQuery: "", previewedClusterId: null });
  });

  it("should hold an empty draft query by default", () => {
    expect(useSearchStore.getState().draftQuery).toBe("");
  });

  it("should set the draft query", () => {
    useSearchStore.getState().setDraftQuery("black holes");
    expect(useSearchStore.getState().draftQuery).toBe("black holes");
  });

  it("should clear the draft query on reset", () => {
    useSearchStore.getState().setDraftQuery("black holes");
    useSearchStore.getState().reset();
    expect(useSearchStore.getState().draftQuery).toBe("");
  });

  it("should set and clear the previewed cluster id", () => {
    useSearchStore.getState().setPreviewedCluster("c-42");
    expect(useSearchStore.getState().previewedClusterId).toBe("c-42");

    useSearchStore.getState().setPreviewedCluster(null);
    expect(useSearchStore.getState().previewedClusterId).toBeNull();
  });

  it("should report the search active only once the draft reaches the minimum length", () => {
    useSearchStore.setState({ draftQuery: "x".repeat(MIN_QUERY_LENGTH - 1) });
    expect(selectIsSearchActive(useSearchStore.getState())).toBe(false);

    useSearchStore.setState({ draftQuery: "x".repeat(MIN_QUERY_LENGTH) });
    expect(selectIsSearchActive(useSearchStore.getState())).toBe(true);
  });
});
