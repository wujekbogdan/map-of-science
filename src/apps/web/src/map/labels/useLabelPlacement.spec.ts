import { renderHook } from "@testing-library/react";
import { zoomIdentity } from "d3";
import { describe, expect, it } from "vitest";
import { useLabelPlacement } from "./useLabelPlacement.ts";

const stubLayouter = () => ({
  lines: ["Hello"],
  widthAtRefFont: 50,
  heightAtRefFont: 11.5,
});

const cluster = (
  id: string,
  x: number,
  y: number,
  level: 1 | 2 | 3 | 4 | 5 | 6 = 1,
) => ({
  id,
  displayName: id,
  position: { x, y },
  labelOffsetPx: 15,
  fontSize: 10,
  level,
});

const minZoomByLevel = {
  1: 5,
  2: 6,
  3: 7,
  4: 8,
  5: 9,
  6: 10,
} as const;

describe("useLabelPlacement", () => {
  it("should return placed labels above each level's threshold for non-overlapping clusters", () => {
    const { result } = renderHook(() =>
      useLabelPlacement({
        clusters: [cluster("a", 0, 0), cluster("b", 500, 500)],
        transform: zoomIdentity.scale(10),
        layouter: stubLayouter,
        minZoomByLevel,
      }),
    );

    expect(result.current.map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("should drop a smaller-level cluster when current zoom is below its threshold", () => {
    const { result } = renderHook(() =>
      useLabelPlacement({
        clusters: [cluster("big", 0, 0, 1), cluster("small", 500, 500, 6)],
        transform: zoomIdentity.scale(7),
        layouter: stubLayouter,
        minZoomByLevel,
      }),
    );

    expect(result.current.map((p) => p.id)).toEqual(["big"]);
  });

  it("should drop all labels when zoom is below every level's threshold", () => {
    const { result } = renderHook(() =>
      useLabelPlacement({
        clusters: [cluster("a", 0, 0, 1)],
        transform: zoomIdentity.scale(2),
        layouter: stubLayouter,
        minZoomByLevel,
      }),
    );

    expect(result.current).toEqual([]);
  });

  it("should drop a later cluster whose label overlaps an earlier one", () => {
    const { result } = renderHook(() =>
      useLabelPlacement({
        clusters: [cluster("high", 0, 0), cluster("low", 5, 0)],
        transform: zoomIdentity.scale(10),
        layouter: stubLayouter,
        minZoomByLevel,
      }),
    );

    expect(result.current.map((p) => p.id)).toEqual(["high"]);
  });

  it("should reuse the result reference when inputs are stable", () => {
    const clusters = [cluster("a", 0, 0)];
    const transform = zoomIdentity.scale(10);
    const { result, rerender } = renderHook(() =>
      useLabelPlacement({
        clusters,
        transform,
        layouter: stubLayouter,
        minZoomByLevel,
      }),
    );

    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });

  it("should recompute when the transform changes", () => {
    const clusters = [cluster("a", 0, 0)];
    const { result, rerender } = renderHook(
      ({ transform }) =>
        useLabelPlacement({
          clusters,
          transform,
          layouter: stubLayouter,
          minZoomByLevel,
        }),
      { initialProps: { transform: zoomIdentity.scale(10) } },
    );

    const first = result.current;
    rerender({ transform: zoomIdentity.scale(10).translate(100, 0) });

    expect(result.current).not.toBe(first);
  });

  it("should cap candidates to maxLabels in input order", () => {
    const { result } = renderHook(() =>
      useLabelPlacement({
        clusters: [
          cluster("a", 0, 0),
          cluster("b", 500, 0),
          cluster("c", 1000, 0),
        ],
        transform: zoomIdentity.scale(10),
        layouter: stubLayouter,
        minZoomByLevel,
        maxLabels: 2,
      }),
    );

    expect(result.current.map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("should carry each placed label's offset and font size through to the caller", () => {
    const { result } = renderHook(() =>
      useLabelPlacement({
        clusters: [{ ...cluster("a", 0, 0), labelOffsetPx: 20, fontSize: 13 }],
        transform: zoomIdentity.scale(10),
        layouter: stubLayouter,
        minZoomByLevel,
      }),
    );

    expect(result.current[0]?.labelOffsetPx).toBe(20);
    expect(result.current[0]?.fontSize).toBe(13);
  });
});
