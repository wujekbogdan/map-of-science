import { renderHook } from "@testing-library/react";
import { zoomIdentity, type ZoomTransform } from "d3";
import { afterEach, describe, expect, it, vi } from "vitest";
import { transformAttr, useZoomed } from "./useZoomed.ts";

const SVG_NS = "http://www.w3.org/2000/svg";
const noop = () => undefined;

afterEach(() => {
  document.body.innerHTML = "";
});

describe("transformAttr", () => {
  it("should format a zoom transform as an SVG transform attribute value", () => {
    const transform = zoomIdentity.translate(10, 20).scale(2);
    expect(transformAttr(transform)).toBe("translate(10,20) scale(2)");
  });
});

describe("useZoomed", () => {
  it("should write the transform attribute on the ref element each time the subscribed handler fires", () => {
    const element = document.createElementNS(SVG_NS, "g");
    let handler: ((transform: ZoomTransform) => void) | undefined;
    const subscribe = vi.fn((fn: (transform: ZoomTransform) => void) => {
      handler = fn;
      return noop;
    });

    renderHook(() => {
      useZoomed(subscribe, { current: element });
    });

    expect(handler).toBeDefined();
    handler!(zoomIdentity.translate(5, 10).scale(3));

    expect(element.getAttribute("transform")).toBe("translate(5,10) scale(3)");
  });

  it("should release the subscription on unmount", () => {
    const element = document.createElementNS(SVG_NS, "g");
    const unsubscribe = vi.fn();
    const subscribe = vi.fn(() => unsubscribe);

    const { unmount } = renderHook(() => {
      useZoomed(subscribe, { current: element });
    });

    expect(unsubscribe).not.toHaveBeenCalled();
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
