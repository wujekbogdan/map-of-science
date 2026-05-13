import { describe, expect, it, vi } from "vitest";
import { createController } from "./controller.ts";
import {
  createFakeDebouncer,
  type FakeDebouncer,
} from "./test-utils/createFakeDebouncer.ts";
import {
  createFakeDriver,
  type FakeDriver,
} from "./test-utils/createFakeDriver.ts";

type Deps = {
  fake: FakeDriver;
  debouncer: FakeDebouncer;
  controller: ReturnType<ReturnType<typeof createController>>;
};

const withController =
  (test: (deps: Deps) => void | Promise<void>) => async () => {
    const fake = createFakeDriver();
    const debouncer = createFakeDebouncer();
    const controller = createController({
      scaleExtent: { min: 0.5, max: 100 },
      debounceMs: 150,
      initial: { x: 0, y: 0, scale: 1 },
      defaults: { animate: true, padding: 0.1 },
      createDriver: fake.create,
      createDebouncer: debouncer.create,
    })(undefined);
    return Promise.resolve(test({ fake, debouncer, controller })).finally(
      () => {
        controller.detach();
        expect.hasAssertions();
      },
    );
  };

describe("controller", () => {
  it(
    "should call the driver's scaleBy with the supplied factor and the configured animate default",
    withController(({ fake, controller }) => {
      controller.zoomBy(2);

      expect(fake.scaleBy).toHaveBeenCalledTimes(1);
      expect(fake.scaleBy).toHaveBeenCalledWith(2, { animate: true });
    }),
  );

  it(
    "should call the driver's applyTransform with the supplied target and the configured animate default",
    withController(({ fake, controller }) => {
      controller.zoomTo({ x: 100, y: 200, scale: 2 });

      expect(fake.applyTransform).toHaveBeenCalledTimes(1);
      expect(fake.applyTransform).toHaveBeenCalledWith(
        { x: 100, y: 200, scale: 2 },
        { animate: true },
      );
    }),
  );

  it(
    "should pan to a translate that centers the supplied point in the viewport at the current scale",
    withController(({ fake, controller }) => {
      controller.setSize({ width: 800, height: 600 });

      controller.panTo({ x: 100, y: 200 });

      // initial scale is 1; center = (-100*1 + 400, -200*1 + 300) = (300, 100)
      expect(fake.applyTransform).toHaveBeenCalledTimes(1);
      expect(fake.applyTransform).toHaveBeenCalledWith(
        { x: 300, y: 100, scale: 1 },
        { animate: true },
      );
    }),
  );

  it(
    "should pan using the latest scale reported by the driver",
    withController(({ fake, controller }) => {
      controller.setSize({ width: 800, height: 600 });
      fake.fireTransform({ x: 0, y: 0, scale: 2 });

      controller.panTo({ x: 100, y: 200 });

      // scale = 2; center = (-100*2 + 400, -200*2 + 300) = (200, -100)
      expect(fake.applyTransform).toHaveBeenCalledWith(
        { x: 200, y: -100, scale: 2 },
        { animate: true },
      );
    }),
  );

  it(
    "should fit the supplied bounding box to the viewport using the configured padding",
    withController(({ fake, controller }) => {
      controller.setSize({ width: 800, height: 600 });

      controller.fitToBox({
        x: { min: 0, max: 100 },
        y: { min: 0, max: 100 },
      });

      // box 100x100, padding 0.1 → effective 120x120
      // scale = min(800/120, 600/120) = 5
      // center (50, 50) → x = -50*5 + 400 = 150; y = -50*5 + 300 = 50
      expect(fake.applyTransform).toHaveBeenCalledTimes(1);
      expect(fake.applyTransform).toHaveBeenCalledWith(
        { x: 150, y: 50, scale: 5 },
        { animate: true },
      );
    }),
  );

  it(
    "should override the configured padding when supplied per call",
    withController(({ fake, controller }) => {
      controller.setSize({ width: 800, height: 600 });

      controller.fitToBox(
        { x: { min: 0, max: 100 }, y: { min: 0, max: 100 } },
        { padding: 0 },
      );

      // no padding: scale = min(800/100, 600/100) = 6
      // center (50, 50) → x = -50*6 + 400 = 100; y = -50*6 + 300 = 0
      expect(fake.applyTransform).toHaveBeenCalledWith(
        { x: 100, y: 0, scale: 6 },
        { animate: true },
      );
    }),
  );

  it(
    "should fit the bounding box of the supplied points to the viewport",
    withController(({ fake, controller }) => {
      controller.setSize({ width: 800, height: 600 });

      controller.fitToPoints([
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ]);

      expect(fake.applyTransform).toHaveBeenCalledWith(
        { x: 150, y: 50, scale: 5 },
        { animate: true },
      );
    }),
  );

  it(
    "should center on the supplied point at scale 1 when only one point is given",
    withController(({ fake, controller }) => {
      controller.setSize({ width: 800, height: 600 });

      controller.fitToPoints([{ x: 100, y: 200 }]);

      // x = -100 + 400 = 300; y = -200 + 300 = 100
      expect(fake.applyTransform).toHaveBeenCalledWith(
        { x: 300, y: 100, scale: 1 },
        { animate: true },
      );
    }),
  );

  it(
    "should center on the supplied point at the requested scale",
    withController(({ fake, controller }) => {
      controller.setSize({ width: 800, height: 600 });

      controller.centerOn({ x: 100, y: 200 }, { scale: 4 });

      // scale = 4; x = -100*4 + 400 = 0; y = -200*4 + 300 = -500
      expect(fake.applyTransform).toHaveBeenCalledTimes(1);
      expect(fake.applyTransform).toHaveBeenCalledWith(
        { x: 0, y: -500, scale: 4 },
        { animate: true },
      );
    }),
  );

  it(
    "should center on the supplied point at the current scale when scale is omitted",
    withController(({ fake, controller }) => {
      controller.setSize({ width: 800, height: 600 });
      fake.fireTransform({ x: 0, y: 0, scale: 2 });

      controller.centerOn({ x: 100, y: 200 });

      // scale = 2; x = -100*2 + 400 = 200; y = -200*2 + 300 = -100
      expect(fake.applyTransform).toHaveBeenCalledWith(
        { x: 200, y: -100, scale: 2 },
        { animate: true },
      );
    }),
  );

  it(
    "should expose the initial transform via getSnapshot before any driver activity",
    withController(({ controller }) => {
      const snapshot = controller.getSnapshot();

      expect(snapshot.transform).toEqual({ x: 0, y: 0, scale: 1 });
      expect(snapshot.settledTransform).toBeUndefined();
      expect(snapshot.bbox).toBeNull();
      expect(snapshot.isReady).toBe(false);
      expect(snapshot.isSettled).toBe(true);
    }),
  );

  it(
    "should update the snapshot transform on each driver tick",
    withController(({ fake, controller }) => {
      fake.fireTransform({ x: 100, y: 200, scale: 2 });

      expect(controller.getSnapshot().transform).toEqual({
        x: 100,
        y: 200,
        scale: 2,
      });
    }),
  );

  it(
    "should notify subscribers on each driver tick",
    withController(({ fake, controller }) => {
      const listener = vi.fn();
      controller.subscribe(listener);

      fake.fireTransform({ x: 100, y: 200, scale: 2 });

      expect(listener).toHaveBeenCalledTimes(1);
    }),
  );

  it(
    "should schedule the debouncer on each driver tick",
    withController(({ fake, debouncer }) => {
      fake.fireTransform({ x: 100, y: 200, scale: 2 });

      expect(debouncer.schedule).toHaveBeenCalledTimes(1);
    }),
  );

  it(
    "should flip isSettled to false on a driver tick",
    withController(({ fake, controller }) => {
      fake.fireTransform({ x: 100, y: 200, scale: 2 });

      expect(controller.getSnapshot().isSettled).toBe(false);
    }),
  );

  it(
    "should restore isSettled to true when the debouncer fires",
    withController(({ fake, debouncer, controller }) => {
      fake.fireTransform({ x: 100, y: 200, scale: 2 });
      debouncer.fire();

      expect(controller.getSnapshot().isSettled).toBe(true);
    }),
  );

  it(
    "should update the settled transform when the debouncer fires",
    withController(({ fake, debouncer, controller }) => {
      fake.fireTransform({ x: 100, y: 200, scale: 2 });
      debouncer.fire();

      expect(controller.getSnapshot().settledTransform).toEqual({
        x: 100,
        y: 200,
        scale: 2,
      });
    }),
  );

  it(
    "should cancel the debouncer on detach",
    withController(({ debouncer, controller }) => {
      controller.detach();

      expect(debouncer.cancel).toHaveBeenCalled();
    }),
  );

  it(
    "should derive bbox from the settled transform and current size",
    withController(({ fake, debouncer, controller }) => {
      controller.setSize({ width: 800, height: 600 });
      fake.fireTransform({ x: 100, y: 50, scale: 2 });
      debouncer.fire();

      // x.min = -100/2 = -50; x.max = (800-100)/2 = 350
      // y.min = -50/2 = -25;  y.max = (600-50)/2 = 275
      expect(controller.getSnapshot().bbox).toEqual({
        x: { min: -50, max: 350 },
        y: { min: -25, max: 275 },
      });
    }),
  );

  it(
    "should re-derive bbox when size changes after the first settle",
    withController(({ fake, debouncer, controller }) => {
      controller.setSize({ width: 800, height: 600 });
      fake.fireTransform({ x: 100, y: 50, scale: 2 });
      debouncer.fire();

      controller.setSize({ width: 1000, height: 800 });

      // x.min = -100/2 = -50; x.max = (1000-100)/2 = 450
      // y.min = -50/2 = -25;  y.max = (800-50)/2 = 375
      expect(controller.getSnapshot().bbox).toEqual({
        x: { min: -50, max: 450 },
        y: { min: -25, max: 375 },
      });
    }),
  );

  it(
    "should flip isReady when the driver signals ready",
    withController(({ fake, controller }) => {
      expect(controller.getSnapshot().isReady).toBe(false);

      fake.fireReady();

      expect(controller.getSnapshot().isReady).toBe(true);
    }),
  );
});
