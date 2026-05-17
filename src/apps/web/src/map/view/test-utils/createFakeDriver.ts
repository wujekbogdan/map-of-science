import { vi } from "vitest";
import type { CreateDriver, Driver, DriverCallbacks } from "../driver.ts";
import type { Transform } from "../transform.ts";

export type FakeDriver = Driver & {
  /** Invoke the bound `onTransform` callback. */
  fireTransform: (transform: Transform) => void;
  /** Invoke the bound `onReady` callback. */
  fireReady: () => void;
  /** Invoke the bound `onBackgroundTap` callback. */
  emitBackgroundTap: () => void;
  /** Plug into `MapViewConfig.createDriver`. */
  create: CreateDriver;
};

export const createFakeDriver = (): FakeDriver => {
  let callbacks: DriverCallbacks | undefined;

  const driver = {
    applyTransform: vi.fn<Driver["applyTransform"]>(),
    scaleBy: vi.fn<Driver["scaleBy"]>(),
    detach: vi.fn<Driver["detach"]>(),
  };

  const create: CreateDriver = ({ callbacks: cbs }) => {
    callbacks = cbs;
    return driver;
  };

  return {
    ...driver,
    fireTransform: (transform) => {
      callbacks?.onTransform(transform);
    },
    fireReady: () => {
      callbacks?.onReady();
    },
    emitBackgroundTap: () => {
      callbacks?.onBackgroundTap();
    },
    create,
  };
};
