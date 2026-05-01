import { renderHook } from "@testing-library/react";
import { zoomIdentity, type ZoomTransform } from "d3";
import { describe, expect, it } from "vitest";
import { useZoom } from "./useZoom.ts";
import { withSvg } from "./withSvg.ts";

const SVG_NS = "http://www.w3.org/2000/svg";

const MAX_SCALE = 100;

describe("useZoom", () => {
  it(
    "should expose scale 1 and no settled transform before any gesture",
    withSvg((svg) => {
      const { result } = renderHook(() => {
        const zoom = useZoom({
          svg: { current: svg },
          initialZoom: { x: 0, y: 0, scale: 1 },
          desiredZoom: null,
        });
        return {
          scale: zoom.scale,
          debouncedTransform: zoom.useDebouncedTransform(),
        };
      });

      expect(result.current.scale).toBe(1);
      expect(result.current.debouncedTransform).toBeUndefined();
    }),
  );

  it(
    "should paint the initial transform on an element bound via useZoomed",
    withSvg((svg) => {
      const foreground = document.createElementNS(SVG_NS, "g");

      renderHook(() => {
        const zoom = useZoom({
          svg: { current: svg },
          initialZoom: { x: 0, y: 0, scale: 1 },
          desiredZoom: null,
        });
        zoom.useZoomed({ current: foreground });
      });

      expect(foreground.getAttribute("transform")).toBe(
        "translate(0,0) scale(1)",
      );
    }),
  );

  it(
    "should paint the background on an element bound via useZoomedBackground",
    withSvg((svg) => {
      renderHook(() => {
        const zoom = useZoom({
          svg: { current: svg },
          initialZoom: { x: 0, y: 0, scale: 1 },
          desiredZoom: null,
        });
        zoom.useZoomedBackground(
          { current: svg },
          {
            imageUrl: "http://example.test/map.svg",
            scaleFactor: 0.1,
            offset: { x: 0, y: 0 },
          },
        );
      });

      expect(svg.style.backgroundImage).toBe(
        'url("http://example.test/map.svg")',
      );
      expect(svg.style.backgroundSize).not.toBe("");
    }),
  );

  it(
    "should preventDefault a pinch wheel event at the scale cap so the browser cannot page-zoom",
    withSvg((svg) => {
      renderHook(() =>
        useZoom({
          svg: { current: svg },
          initialZoom: { x: 0, y: 0, scale: 1 },
          desiredZoom: null,
        }),
      );

      // d3-zoom stores the active transform on the SVG node as __zoom.
      // Pinning it to MAX_SCALE simulates "user already at the cap" without
      // running an async d3 transition. d3-zoom@3 then returns from its
      // wheel handler without preventDefault on the next clamping tick.
      (svg as unknown as { __zoom: ZoomTransform }).__zoom =
        zoomIdentity.scale(MAX_SCALE);

      const wheel = new WheelEvent("wheel", {
        ctrlKey: true,
        deltaY: -1,
        bubbles: true,
        cancelable: true,
      });
      // happy-dom's SVGPoint lacks matrixTransform, so d3-zoom's pointer()
      // throws inside its own wheel handler. The defensive listener is
      // registered before d3's wheel.zoom and sets defaultPrevented before
      // the throw, which is what the assertion below checks.
      try {
        svg.dispatchEvent(wheel);
      } catch {
        // the throw is a happy-dom limitation, not the behavior under test
      }

      expect(wheel.defaultPrevented).toBe(true);
    }),
  );
});
