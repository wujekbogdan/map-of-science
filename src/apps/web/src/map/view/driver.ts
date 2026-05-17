import type { Transform } from "./transform.ts";

/**
 * Announces that something happened, and nothing more.
 *
 * A signal carries no data and gives the listener nothing to read back. That
 * is deliberate: the moment a notification can hand over a value, it becomes a
 * second, informal place to keep state, and the line between "what just
 * happened" and "what is currently true" blurs. Withholding any payload keeps
 * that line from eroding over time. State has one home, the view snapshot; a
 * signal only reports that a moment occurred. Anything a listener needs to know
 * about the current view it reads from the snapshot, never from the signal.
 */
export type MapViewSignal = () => void;

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

  /**
   * Fires when the user taps the bare surface: a click the driver classifies as a tap rather than a pan or zoom, landing on the surface itself and not on any rendered content.
   */
  onBackgroundTap: MapViewSignal;
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
