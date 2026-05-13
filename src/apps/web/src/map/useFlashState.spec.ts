import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFlashState } from "./useFlashState.ts";

describe("useFlashState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should not flash when trigger changes while shouldFlash is false", () => {
    const { result, rerender } = renderHook(
      ({ trigger, shouldFlash }) => useFlashState({ trigger, shouldFlash }),
      { initialProps: { trigger: 1, shouldFlash: false } },
    );

    expect(result.current).toBe(false);
    rerender({ trigger: 2, shouldFlash: false });
    expect(result.current).toBe(false);
  });
});
