import { renderHook } from "@testing-library/react";
import { zoomIdentity } from "d3";
import { describe, expect, it } from "vitest";
import { useLabelPlacement } from "./useLabelPlacement.ts";

const stubLayouter = () => ({
  lines: ["Hello"],
  widthAtRefFont: 50,
  heightAtRefFont: 11.5,
});

const cluster = (id: string, x: number, y: number) => ({
  id,
  displayName: id,
  position: { x, y },
  labelOffsetPx: 15,
});

describe("useLabelPlacement", () => {
  it("should return an empty list below the zoom threshold", () => {
    const { result } = renderHook(() =>
      useLabelPlacement({
        clusters: [cluster("a", 0, 0)],
        transform: zoomIdentity,
        fontSize: 10,
        layouter: stubLayouter,
      }),
    );

    expect(result.current).toEqual([]);
  });

  it("should return placed labels above the threshold for non-overlapping clusters", () => {
    const { result } = renderHook(() =>
      useLabelPlacement({
        clusters: [cluster("a", 0, 0), cluster("b", 500, 500)],
        transform: zoomIdentity.scale(10),
        fontSize: 10,
        layouter: stubLayouter,
      }),
    );

    expect(result.current.map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("should drop a later cluster whose label overlaps an earlier one", () => {
    const { result } = renderHook(() =>
      useLabelPlacement({
        clusters: [cluster("high", 0, 0), cluster("low", 5, 0)],
        transform: zoomIdentity.scale(10),
        fontSize: 10,
        layouter: stubLayouter,
      }),
    );

    expect(result.current.map((p) => p.id)).toEqual(["high"]);
  });

  it("should reuse the result reference when inputs are stable", () => {
    const clusters = [cluster("a", 0, 0)];
    const transform = zoomIdentity.scale(10);
    const { result, rerender } = renderHook(
      ({ fontSize }) =>
        useLabelPlacement({
          clusters,
          transform,
          fontSize,
          layouter: stubLayouter,
        }),
      { initialProps: { fontSize: 10 } },
    );

    const first = result.current;
    rerender({ fontSize: 10 });

    expect(result.current).toBe(first);
  });

  it("should recompute when the transform changes", () => {
    const clusters = [cluster("a", 0, 0)];
    const { result, rerender } = renderHook(
      ({ transform }) =>
        useLabelPlacement({
          clusters,
          transform,
          fontSize: 10,
          layouter: stubLayouter,
        }),
      { initialProps: { transform: zoomIdentity.scale(10) } },
    );

    const first = result.current;
    rerender({ transform: zoomIdentity.scale(10).translate(100, 0) });

    expect(result.current).not.toBe(first);
  });

  it("should carry each placed label's screen-space offset through to the caller", () => {
    const { result } = renderHook(() =>
      useLabelPlacement({
        clusters: [{ ...cluster("a", 0, 0), labelOffsetPx: 20 }],
        transform: zoomIdentity.scale(10),
        fontSize: 10,
        layouter: stubLayouter,
      }),
    );

    expect(result.current[0]?.labelOffsetPx).toBe(20);
  });
});
