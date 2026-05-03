/**
 * Defers a single fire until `schedule()` has stopped being called for the configured window.
 *
 * Any `schedule()` call before the window elapses replaces the pending fire and restarts the wait. `cancel()` drops a pending fire without firing.
 */
export type Debouncer = {
  schedule: () => void;
  cancel: () => void;
};

export type CreateDebouncer = (ms: number, onFire: () => void) => Debouncer;

export const createDebouncer: CreateDebouncer = (ms, onFire) => {
  let pending: ReturnType<typeof setTimeout> | null = null;

  const cancel = () => {
    if (pending !== null) clearTimeout(pending);
    pending = null;
  };

  return {
    schedule: () => {
      cancel();
      pending = setTimeout(() => {
        pending = null;
        onFire();
      }, ms);
    },
    cancel,
  };
};
