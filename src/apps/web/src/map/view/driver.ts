import type { Transform } from "./transform.ts";

/**
 * Command surface for moving and scaling the view.
 *
 * Commands supersede each other: a new call replaces any in-progress transition, and the latest call always wins.
 */
export type Driver = {
  /**
   * Move to `target`.
   */
  applyTransform: (target: Transform, options: { animate: boolean }) => void;

  /**
   * Multiply the current scale by `factor`, anchored at the viewport center at the moment of the call.
   */
  scaleBy: (factor: number, options: { animate: boolean }) => void;

  /**
   * End the driver's lifetime. After detach the driver no longer accepts commands and stops invoking any callback supplied to it.
   */
  detach: () => void;
};

/**
 * Notifications the driver emits.
 */
export type DriverCallbacks = {
  /**
   * Fires whenever the driver applies a new transform. May fire at display refresh rate.
   */
  onTransform: (transform: Transform) => void;

  /**
   * Fires once, after the driver has applied the initial transform and is ready to accept commands.
   */
  onReady: () => void;
};

/**
 * Constructs a Driver bound to a renderer surface.
 */
export type CreateDriver<Surface = unknown> = (args: {
  surface: Surface;
  callbacks: DriverCallbacks;
  initial: Transform;
  /** Enforced by the driver on every command. */
  scaleExtent: { min: number; max: number };
}) => Driver;
