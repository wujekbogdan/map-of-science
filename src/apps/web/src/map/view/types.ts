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
   * Center the view on `point` at the requested scale; falls back to the current scale when omitted.
   */
  centerOn: (
    point: Point,
    options?: CommandOptions & { scale?: number },
  ) => void;

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
