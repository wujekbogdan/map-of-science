import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useNavigateToCluster } from "./useNavigateToCluster.ts";

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

const anyFunction: unknown = expect.any(Function);

type Deps = {
  navigate: ReturnType<typeof useNavigateToCluster>;
};

const withUseNavigateToCluster = (test: (deps: Deps) => void) => () => {
  mockNavigate.mockClear();
  try {
    const { result } = renderHook(() => useNavigateToCluster());
    test({ navigate: result.current });
  } finally {
    expect.hasAssertions();
  }
};

describe("useNavigateToCluster", () => {
  it(
    "should call navigate with /cluster/$id and the given id",
    withUseNavigateToCluster(({ navigate }) => {
      void navigate("abc-123");
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, {
        to: "/cluster/$id",
        params: { id: "abc-123" },
        state: { source: undefined },
        search: anyFunction,
      });
    }),
  );

  it(
    "should mark location state with source 'map' when fromMap is true",
    withUseNavigateToCluster(({ navigate }) => {
      void navigate("abc-123", { fromMap: true });
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, {
        to: "/cluster/$id",
        params: { id: "abc-123" },
        state: { source: "map" },
        search: anyFunction,
      });
    }),
  );

  it(
    "should preserve the existing search params so an active query survives navigation",
    withUseNavigateToCluster(({ navigate }) => {
      void navigate("abc-123");
      const { search } = mockNavigate.mock.calls[0][0] as {
        search: (prev: Record<string, unknown>) => Record<string, unknown>;
      };
      expect(search({ q: "quantum" })).toEqual({ q: "quantum" });
    }),
  );
});
