import { renderHook } from "@testing-library/react";
import { zoomIdentity, type ZoomTransform } from "d3";
import { describe, expect, it, vi } from "vitest";
import { backgroundStyle, useZoomedBackground } from "./useZoomedBackground.ts";
import { withSvg } from "./withSvg.ts";

const noop = () => undefined;

describe("backgroundStyle", () => {
  it("should compute background size and position from the transform, scale factor, and offset", () => {
    // With VIEW_BOX {18340.723, 18561.087} and combined scale = 0.1 * 2 = 0.2:
    //   width     = 3668.1446
    //   height    = 3712.2174
    //   positionX = 100 + 10*2 - 3668.1446/2 = -1714.0723
    //   positionY =  50 + 20*2 - 3712.2174/2 = -1766.1087
    const style = backgroundStyle(
      zoomIdentity.translate(100, 50).scale(2),
      0.1,
      { x: 10, y: 20 },
    );

    const parsePixels = (value: string) =>
      value.split(" ").map((piece) => parseFloat(piece));
    const [width, height] = parsePixels(style.backgroundSize);
    const [positionX, positionY] = parsePixels(style.backgroundPosition);

    expect(width).toBeCloseTo(3668.1446, 4);
    expect(height).toBeCloseTo(3712.2174, 4);
    expect(positionX).toBeCloseTo(-1714.0723, 4);
    expect(positionY).toBeCloseTo(-1766.1087, 4);
  });
});

describe("useZoomedBackground", () => {
  it(
    "should write the static background image and repeat rule when the url is provided",
    withSvg((svg) => {
      renderHook(() => {
        useZoomedBackground(
          vi.fn(() => noop),
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
      expect(svg.style.backgroundRepeat).toBe("no-repeat");
    }),
  );

  it(
    "should apply background size and position each time the subscribed handler fires",
    withSvg((svg) => {
      let handler: ((transform: ZoomTransform) => void) | undefined;
      const subscribe = vi.fn((fn: (transform: ZoomTransform) => void) => {
        handler = fn;
        return noop;
      });

      renderHook(() => {
        useZoomedBackground(
          subscribe,
          { current: svg },
          {
            imageUrl: "http://example.test/map.svg",
            scaleFactor: 0.1,
            offset: { x: 10, y: 20 },
          },
        );
      });

      expect(handler).toBeDefined();
      handler!(zoomIdentity.translate(100, 50).scale(2));

      expect(svg.style.backgroundSize).not.toBe("");
      expect(svg.style.backgroundPosition).not.toBe("");
    }),
  );

  it(
    "should release the subscription on unmount",
    withSvg((svg) => {
      const unsubscribe = vi.fn();
      const subscribe = vi.fn(() => unsubscribe);

      const { unmount } = renderHook(() => {
        useZoomedBackground(
          subscribe,
          { current: svg },
          {
            imageUrl: "http://example.test/map.svg",
            scaleFactor: 0.1,
            offset: { x: 0, y: 0 },
          },
        );
      });

      expect(unsubscribe).not.toHaveBeenCalled();
      unmount();
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    }),
  );
});
