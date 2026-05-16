import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useClearViewedCluster } from "./useClearViewedCluster.ts";

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

const anyFunction: unknown = expect.any(Function);

type Deps = {
  clear: ReturnType<typeof useClearViewedCluster>;
};

const withUseClearViewedCluster = (test: (deps: Deps) => void) => () => {
  mockNavigate.mockClear();
  try {
    const { result } = renderHook(() => useClearViewedCluster());
    test({ clear: result.current });
  } finally {
    expect.hasAssertions();
  }
};

describe("useClearViewedCluster", () => {
  it(
    "should navigate back to the map root",
    withUseClearViewedCluster(({ clear }) => {
      void clear();
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, {
        to: "/",
        search: anyFunction,
      });
    }),
  );

  it(
    "should preserve the existing search params so an active query survives",
    withUseClearViewedCluster(({ clear }) => {
      void clear();
      const { search } = mockNavigate.mock.calls[0][0] as {
        search: (prev: Record<string, unknown>) => Record<string, unknown>;
      };
      expect(search({ q: "quantum" })).toEqual({ q: "quantum" });
    }),
  );
});
