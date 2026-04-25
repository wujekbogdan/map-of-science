import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useZoom } from "./useZoom.ts";
import { withSvg } from "./withSvg.ts";

const SVG_NS = "http://www.w3.org/2000/svg";

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
});
