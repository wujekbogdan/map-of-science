import { afterEach, describe, expect, it, vi } from "vitest";
import { createDebouncer } from "./debouncer.ts";

afterEach(() => {
  vi.useRealTimers();
});

describe("createDebouncer", () => {
  it("should fire after the configured window elapses", () => {
    vi.useFakeTimers();
    const onFire = vi.fn();
    const debouncer = createDebouncer(150, onFire);

    debouncer.schedule();
    expect(onFire).not.toHaveBeenCalled();

    vi.advanceTimersByTime(150);

    expect(onFire).toHaveBeenCalledTimes(1);
  });

  it("should restart the window when scheduled again before firing", () => {
    vi.useFakeTimers();
    const onFire = vi.fn();
    const debouncer = createDebouncer(150, onFire);

    debouncer.schedule();
    vi.advanceTimersByTime(100);
    debouncer.schedule();
    vi.advanceTimersByTime(100);

    expect(onFire).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(onFire).toHaveBeenCalledTimes(1);
  });

  it("should not fire after cancel", () => {
    vi.useFakeTimers();
    const onFire = vi.fn();
    const debouncer = createDebouncer(150, onFire);

    debouncer.schedule();
    debouncer.cancel();
    vi.advanceTimersByTime(150);

    expect(onFire).not.toHaveBeenCalled();
  });
});
