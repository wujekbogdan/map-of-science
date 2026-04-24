import { renderHook } from "@testing-library/react";
import { zoomIdentity } from "d3";
import { describe, expect, it } from "vitest";
import { useLabelPlacement } from "./useLabelPlacement.ts";

const stubLayouter = () => ({
  lines: ["Hello"],
  widthAtRefFont: 50,
  heightAtRefFont: 11.5,
});

describe("useLabelPlacement", () => {
  it("should return an empty list below the zoom threshold", () => {
    const { result } = renderHook(() =>
      useLabelPlacement({
        clusters: [{ id: "a", displayName: "Hello", position: { x: 0, y: 0 } }],
        transform: zoomIdentity.scale(0.5),
        fontSize: 10,
        offset: 15,
        layouter: stubLayouter,
      }),
    );

    expect(result.current).toEqual([]);
  });

  it("should return placed labels above the threshold for non-overlapping clusters", () => {
    const { result } = renderHook(() =>
      useLabelPlacement({
        clusters: [
          { id: "a", displayName: "A", position: { x: 0, y: 0 } },
          { id: "b", displayName: "B", position: { x: 500, y: 500 } },
        ],
        transform: zoomIdentity,
        fontSize: 10,
        offset: 15,
        layouter: stubLayouter,
      }),
    );

    expect(result.current).toEqual([
      { id: "a", layout: stubLayouter() },
      { id: "b", layout: stubLayouter() },
    ]);
  });

  it("should drop a later cluster whose label overlaps an earlier one", () => {
    // stub layout is 50x11.5. Clusters at (0,0) and (5,0) overlap in x.
    const { result } = renderHook(() =>
      useLabelPlacement({
        clusters: [
          { id: "high", displayName: "High", position: { x: 0, y: 0 } },
          { id: "low", displayName: "Low", position: { x: 5, y: 0 } },
        ],
        transform: zoomIdentity,
        fontSize: 10,
        offset: 15,
        layouter: stubLayouter,
      }),
    );

    expect(result.current.map((p) => p.id)).toEqual(["high"]);
  });

  it("should reuse the result reference when inputs are stable", () => {
    const clusters = [{ id: "a", displayName: "A", position: { x: 0, y: 0 } }];
    const { result, rerender } = renderHook(
      ({ offset }) =>
        useLabelPlacement({
          clusters,
          transform: zoomIdentity,
          fontSize: 10,
          offset,
          layouter: stubLayouter,
        }),
      { initialProps: { offset: 15 } },
    );

    const first = result.current;
    rerender({ offset: 15 });

    expect(result.current).toBe(first);
  });

  it("should recompute when the transform changes", () => {
    const clusters = [{ id: "a", displayName: "A", position: { x: 0, y: 0 } }];
    const { result, rerender } = renderHook(
      ({ transform }) =>
        useLabelPlacement({
          clusters,
          transform,
          fontSize: 10,
          offset: 15,
          layouter: stubLayouter,
        }),
      { initialProps: { transform: zoomIdentity } },
    );

    const first = result.current;
    rerender({ transform: zoomIdentity.translate(100, 0) });

    expect(result.current).not.toBe(first);
  });
});
