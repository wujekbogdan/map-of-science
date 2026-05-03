import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Context, type ContextValue, type Controller } from "./context.ts";
import { createController } from "./controller.ts";
import type { CreateDebouncer } from "./debouncer.ts";
import type { CreateDriver } from "./driver.ts";
import type { Transform } from "./transform.ts";

/**
 * 2D point in World coords (see `Transform`).
 */
export type Point = { x: number; y: number };

/**
 * Axis-aligned bounding box in World coords.
 */
export type BBox = {
  x: { min: number; max: number };
  y: { min: number; max: number };
};

export type CommandOptions = {
  animate?: boolean;
};

export type FitOptions = CommandOptions & {
  /** Dimensionless 0..1 fraction. */
  padding?: number;
};

/**
 * Command handle for the view. Commands are fire-and-forget; a new call replaces any in-progress transition.
 */
export type MapView = {
  /**
   * Zoom about the current viewport center.
   */
  zoomBy: (factor: number, options?: CommandOptions) => void;

  /**
   * Replace the current transform with `target`.
   */
  zoomTo: (target: Transform, options?: CommandOptions) => void;

  /**
   * Center the view on `point`. Scale is unchanged.
   */
  panTo: (point: Point, options?: CommandOptions) => void;

  /**
   * Fit `box` to the viewport.
   */
  fitToBox: (box: BBox, options?: FitOptions) => void;

  /**
   * Position the view so all `points` are visible. A single point centers the view on that point at scale 1.
   */
  fitToPoints: (points: Point[], options?: FitOptions) => void;
};

/**
 * Configuration bound at MapView mount.
 */
export type MapViewConfig<Surface = unknown> = {
  scaleExtent: { min: number; max: number };

  /** How long a transform must remain unchanged before it counts as settled. */
  debounceMs: number;

  initial: Transform;

  /** Implicit values for command options. Per-call options override individual fields; the rest fall back here. */
  defaults: {
    animate: boolean;
    /** Dimensionless 0..1 fraction. */
    padding: number;
  };

  createDriver: CreateDriver<Surface>;

  createDebouncer: CreateDebouncer;
};

type Size = { width: number; height: number };

type BackgroundConfig = {
  imageUrl: string | undefined;
  scaleFactor: number;
  offset: { x: number; y: number };
};

// Natural dimensions of the map.svg image used as the background.
const BACKGROUND_VIEW_BOX = { width: 18340.723, height: 18561.087 };

const backgroundStyle = (
  transform: Transform,
  scaleFactor: number,
  offset: { x: number; y: number },
) => {
  const scale = scaleFactor * transform.scale;
  const width = BACKGROUND_VIEW_BOX.width * scale;
  const height = BACKGROUND_VIEW_BOX.height * scale;
  const positionX = transform.x + offset.x * transform.scale - width / 2;
  const positionY = transform.y + offset.y * transform.scale - height / 2;
  return {
    backgroundSize: `${width.toString()}px ${height.toString()}px`,
    backgroundPosition: `${positionX.toString()}px ${positionY.toString()}px`,
  };
};

/**
 * Renders the map's `<svg>` and provides the view controller to its descendants. Children mount only after the surface is captured, so hooks called from children always observe a fully initialized view.
 */
export const MapView = ({
  config,
  size,
  background,
  chrome,
  children,
}: {
  config: MapViewConfig<SVGSVGElement>;
  size: Size;
  background?: BackgroundConfig;
  /** HTML siblings of the `<svg>`. Render here for headers, overlays, controls. */
  chrome?: ReactNode;
  /** SVG content. Render here for clusters, areas, foreground groups. */
  children?: ReactNode;
}) => {
  const [svg, setSvg] = useState<SVGSVGElement | null>(null);
  const [controller, setController] = useState<Controller | null>(null);

  useEffect(() => {
    if (!svg) return;
    const next = createController(config)(svg);
    setController(next);
    return () => {
      next.detach();
      setController(null);
    };
  }, [svg, config]);

  // Sync size during render so commands fired by child effects observe the
  // latest value. setSize is idempotent.
  controller?.setSize(size);

  useEffect(() => {
    if (!svg || !background?.imageUrl) return;
    svg.style.backgroundImage = `url(${background.imageUrl})`;
    svg.style.backgroundRepeat = "no-repeat";
  }, [svg, background?.imageUrl]);

  const backgroundOffset = background?.offset;
  useEffect(() => {
    if (!svg || !controller || !background?.imageUrl || !backgroundOffset) {
      return;
    }
    const apply = () => {
      Object.assign(
        svg.style,
        backgroundStyle(
          controller.getSnapshot().transform,
          background.scaleFactor,
          backgroundOffset,
        ),
      );
    };
    apply();
    return controller.subscribe(apply);
  }, [
    svg,
    controller,
    background?.imageUrl,
    background?.scaleFactor,
    backgroundOffset,
  ]);

  const value = useMemo<ContextValue | null>(() => {
    if (!controller) return null;
    return {
      command: {
        zoomBy: (factor, options) => controller.zoomBy(factor, options),
        zoomTo: (target, options) => controller.zoomTo(target, options),
        panTo: (point, options) => controller.panTo(point, options),
        fitToBox: (box, options) => controller.fitToBox(box, options),
        fitToPoints: (points, options) =>
          controller.fitToPoints(points, options),
      },
      subscribe: controller.subscribe,
      getSnapshot: controller.getSnapshot,
    };
  }, [controller]);

  return (
    <Context.Provider value={value}>
      {controller && chrome}
      <svg
        ref={setSvg}
        width={size.width}
        height={size.height}
        style={{ display: "block" }}
      >
        {controller && children}
      </svg>
    </Context.Provider>
  );
};
