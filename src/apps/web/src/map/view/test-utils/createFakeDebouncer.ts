import { vi } from "vitest";
import type { CreateDebouncer, Debouncer } from "../debouncer.ts";

export type FakeDebouncer = Debouncer & {
  /** Invoke the bound `onFire` callback. */
  fire: () => void;
  /** Plug into `MapViewConfig.createDebouncer`. */
  create: CreateDebouncer;
};

export const createFakeDebouncer = (): FakeDebouncer => {
  let onFire: (() => void) | null = null;
  const schedule = vi.fn<Debouncer["schedule"]>();
  const cancel = vi.fn<Debouncer["cancel"]>();

  const create: CreateDebouncer = (_ms, fire) => {
    onFire = fire;
    return { schedule, cancel };
  };

  return {
    schedule,
    cancel,
    fire: () => {
      onFire?.();
    },
    create,
  };
};
