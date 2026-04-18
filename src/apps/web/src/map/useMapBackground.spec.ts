import { renderHook } from "@testing-library/react";
import { zoomIdentity, type ZoomTransform } from "d3";
import { afterEach, describe, expect, it, vi } from "vitest";
import { backgroundStyle, useMapBackground } from "./useMapBackground.ts";

const SVG_NS = "http://www.w3.org/2000/svg";
const noop = () => undefined;

const makeSvg = () => {
  const element = document.createElementNS(SVG_NS, "svg");
  document.body.appendChild(element);
  return element;
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("backgroundStyle", () => {
  it("should compute background size and position from the transform, scale factor, and offset", () => {
    // With VIEW_BOX {18340.723, 18561.087} and scale = 0.1 * 2 = 0.2:
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

describe("useMapBackground", () => {
  it("should write the static background image and repeat rule when the url is provided", () => {
    const svg = makeSvg();
    const subscribe = vi.fn(() => noop);

    renderHook(() =>
      useMapBackground({ current: svg }, subscribe, {
        mapSvgUrl: "http://example.test/map.svg",
        svgScaleFactor: 0.1,
        svgOffset: { x: 0, y: 0 },
      }),
    );

    expect(svg.style.backgroundImage).toBe(
      'url("http://example.test/map.svg")',
    );
    expect(svg.style.backgroundRepeat).toBe("no-repeat");
  });

  it("should apply background size and position each time the subscribed handler fires", () => {
    const svg = makeSvg();
    let handler: ((transform: ZoomTransform) => void) | undefined;
    const subscribe = vi.fn((fn: (transform: ZoomTransform) => void) => {
      handler = fn;
      return noop;
    });

    renderHook(() =>
      useMapBackground({ current: svg }, subscribe, {
        mapSvgUrl: "http://example.test/map.svg",
        svgScaleFactor: 0.1,
        svgOffset: { x: 10, y: 20 },
      }),
    );

    expect(handler).toBeDefined();
    handler!(zoomIdentity.translate(100, 50).scale(2));

    expect(svg.style.backgroundSize).not.toBe("");
    expect(svg.style.backgroundPosition).not.toBe("");
  });

  it("should release the subscription on unmount", () => {
    const svg = makeSvg();
    const unsubscribe = vi.fn();
    const subscribe = vi.fn(() => unsubscribe);

    const { unmount } = renderHook(() =>
      useMapBackground({ current: svg }, subscribe, {
        mapSvgUrl: "http://example.test/map.svg",
        svgScaleFactor: 0.1,
        svgOffset: { x: 0, y: 0 },
      }),
    );

    expect(unsubscribe).not.toHaveBeenCalled();
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
