import { renderHook } from "@testing-library/react";
import type { ZoomTransform } from "d3";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useD3Zoom } from "./useD3Zoom.ts";

const SVG_NS = "http://www.w3.org/2000/svg";

const mountRefs = () => {
  const svg = document.createElementNS(SVG_NS, "svg");
  const foreground = document.createElementNS(SVG_NS, "g");
  svg.appendChild(foreground);
  document.body.appendChild(svg);
  return { svg, foreground };
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useD3Zoom", () => {
  it("should fire a subscriber with the current transform immediately on subscribe", () => {
    const { svg, foreground } = mountRefs();
    const { result } = renderHook(() =>
      useD3Zoom({
        svg: { current: svg },
        foreground: { current: foreground },
        initialZoom: { x: 0, y: 0, scale: 1 },
        desiredZoom: null,
      }),
    );

    const handler = vi.fn<(transform: ZoomTransform) => void>();
    result.current.subscribe(handler);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].k).toBe(1);
  });
});
