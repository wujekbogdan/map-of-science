import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useHoverIntent } from "./useHoverIntent.ts";

type Props = { candidate: string | null };

const renderIntent = (initial: string | null = null, delayMs = 120) => {
  const initialProps: Props = { candidate: initial };
  return renderHook(
    ({ candidate }: Props) => useHoverIntent(candidate, delayMs),
    { initialProps },
  );
};

afterEach(() => {
  vi.useRealTimers();
});

describe("useHoverIntent", () => {
  it("should commit a non-null candidate after the dwell window elapses", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderIntent();

    rerender({ candidate: "a" });
    expect(result.current).toBeNull();

    act(() => {
      vi.advanceTimersByTime(120);
    });

    expect(result.current).toBe("a");
  });

  it("should not commit before the dwell window elapses", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderIntent();

    rerender({ candidate: "a" });

    act(() => {
      vi.advanceTimersByTime(119);
    });

    expect(result.current).toBeNull();
  });

  it("should clear to null immediately when the candidate flips to null", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderIntent();

    rerender({ candidate: "a" });
    act(() => {
      vi.advanceTimersByTime(120);
    });
    expect(result.current).toBe("a");

    rerender({ candidate: null });

    expect(result.current).toBeNull();
  });

  it("should clear immediately and dwell on the new candidate when swapping from one non-null to another", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderIntent();

    rerender({ candidate: "a" });
    act(() => {
      vi.advanceTimersByTime(120);
    });
    expect(result.current).toBe("a");

    rerender({ candidate: "b" });
    expect(result.current).toBeNull();

    act(() => {
      vi.advanceTimersByTime(120);
    });
    expect(result.current).toBe("b");
  });

  it("should not commit a candidate that was canceled before the dwell window elapses", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderIntent();

    rerender({ candidate: "a" });
    act(() => {
      vi.advanceTimersByTime(50);
    });
    rerender({ candidate: null });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBeNull();
  });

  it("should clear the pending timer on unmount", () => {
    vi.useFakeTimers();
    const { rerender, unmount } = renderIntent();

    rerender({ candidate: "a" });
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
