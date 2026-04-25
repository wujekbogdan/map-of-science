import { renderHook } from "@testing-library/react";
import { zoomIdentity } from "d3";
import { describe, expect, it } from "vitest";
import { useZoomBbox } from "./useZoomBbox.ts";

describe("useZoomBbox", () => {
  it("should return null while the transform is undefined", () => {
    const { result } = renderHook(() =>
      useZoomBbox(undefined, { width: 100, height: 80 }),
    );

    expect(result.current).toBeNull();
  });

  it("should return the bbox the transform maps to the viewport", () => {
    // zoomIdentity.translate(10, 20).scale(2) maps screen → world as:
    //   invertX(0)   = -10/2 = -5;  invertX(100) = (100-10)/2 = 45
    //   invertY(0)   = -20/2 = -10; invertY(80)  = (80-20)/2  = 30
    const transform = zoomIdentity.translate(10, 20).scale(2);
    const { result } = renderHook(() =>
      useZoomBbox(transform, { width: 100, height: 80 }),
    );

    expect(result.current).toEqual({
      x: { min: -5, max: 45 },
      y: { min: -10, max: 30 },
    });
  });
});
