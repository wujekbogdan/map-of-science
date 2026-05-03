import { describe, expect, it } from "vitest";
import { withDriver } from "./test-utils/withDriver.ts";

describe("createD3ZoomDriver", () => {
  it(
    "should fire onTransform and onReady on construction with the supplied initial transform",
    withDriver(({ onTransform, onReady }) => {
      expect(onTransform).toHaveBeenCalledWith({ x: 0, y: 0, scale: 1 });
      expect(onReady).toHaveBeenCalledTimes(1);
    }),
  );

  it(
    "should fire onTransform with the target when applyTransform runs without animation",
    withDriver(({ driver, onTransform }) => {
      onTransform.mockClear();

      driver.applyTransform({ x: 100, y: 200, scale: 2 }, { animate: false });

      expect(onTransform).toHaveBeenLastCalledWith({
        x: 100,
        y: 200,
        scale: 2,
      });
    }),
  );

  it(
    "should anchor scaleBy on the viewport center",
    withDriver(({ svg, driver, onTransform }) => {
      svg.setAttribute("viewBox", "0 0 800 600");
      onTransform.mockClear();

      driver.scaleBy(2, { animate: false });

      // identity → scale 2 anchored at (400, 300)
      // world point at center pre-zoom: (400, 300) / 1 = (400, 300)
      // post-zoom: 400 = 400*2 + x → x = -400; 300 = 300*2 + y → y = -300
      expect(onTransform).toHaveBeenLastCalledWith({
        x: -400,
        y: -300,
        scale: 2,
      });
    }),
  );

  it(
    "should stop firing onTransform after detach",
    withDriver(({ driver, onTransform }) => {
      driver.detach();
      onTransform.mockClear();

      driver.applyTransform({ x: 100, y: 200, scale: 2 }, { animate: false });

      expect(onTransform).not.toHaveBeenCalled();
    }),
  );

  it(
    "should defer applyTransform via a transition when animate is true",
    withDriver(({ driver, onTransform }) => {
      onTransform.mockClear();

      driver.applyTransform({ x: 100, y: 200, scale: 2 }, { animate: true });

      expect(onTransform).not.toHaveBeenCalled();
    }),
  );

  it(
    "should preventDefault on a pinch wheel event at the scale cap",
    withDriver(({ svg }) => {
      // Pin d3-zoom's stored transform to the cap so its wheel handler returns
      // without preventDefault on the next clamping tick.
      Object.assign(svg as unknown as { __zoom: object }, {
        __zoom: { x: 0, y: 0, k: 100 },
      });

      const wheel = new WheelEvent("wheel", {
        ctrlKey: true,
        deltaY: -1,
        bubbles: true,
        cancelable: true,
      });
      try {
        svg.dispatchEvent(wheel);
      } catch {
        // happy-dom's SVGPoint lacks matrixTransform, so d3-zoom's pointer()
        // throws inside its own wheel handler; the defensive listener runs
        // first and sets defaultPrevented before the throw.
      }

      expect(wheel.defaultPrevented).toBe(true);
    }),
  );
});
