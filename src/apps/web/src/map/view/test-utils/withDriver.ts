import { expect, vi } from "vitest";
import { createD3ZoomDriver } from "../createD3ZoomDriver.ts";
import type { Driver } from "../driver.ts";
import { withSvg } from "./withSvg.ts";

type Deps = {
  svg: SVGSVGElement;
  driver: Driver;
  onTransform: ReturnType<typeof vi.fn>;
  onReady: ReturnType<typeof vi.fn>;
  onBackgroundTap: ReturnType<typeof vi.fn>;
};

export const withDriver = (test: (deps: Deps) => void | Promise<void>) =>
  withSvg(async (svg) => {
    const onTransform = vi.fn();
    const onReady = vi.fn();
    const onBackgroundTap = vi.fn();
    const driver = createD3ZoomDriver({
      surface: svg,
      callbacks: { onTransform, onReady, onBackgroundTap },
      initial: { x: 0, y: 0, scale: 1 },
      scaleExtent: { min: 0.5, max: 100 },
    });
    try {
      await test({ svg, driver, onTransform, onReady, onBackgroundTap });
    } finally {
      driver.detach();
      expect.hasAssertions();
    }
  });
