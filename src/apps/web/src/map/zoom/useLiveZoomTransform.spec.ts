import { act, renderHook } from "@testing-library/react";
import { zoomIdentity, type ZoomTransform } from "d3";
import { describe, expect, it, vi } from "vitest";
import { useLiveZoomTransform } from "./useLiveZoomTransform.ts";

type Listener = (transform: ZoomTransform) => void;

const setup = () => {
  const subscribe = vi.fn<(fn: Listener) => () => void>(() => () => undefined);
  const { result } = renderHook(() => useLiveZoomTransform(subscribe));
  const fire = (transform: ZoomTransform) => {
    act(() => {
      subscribe.mock.calls[0]?.[0](transform);
    });
  };
  return { result, fire };
};

describe("useLiveZoomTransform", () => {
  it("should be undefined before any zoom event has fired", () => {
    const { result } = setup();

    expect(result.current).toBeUndefined();
  });

  it("should expose the transform after a zoom event with a new k", () => {
    const { result, fire } = setup();

    fire(zoomIdentity.scale(2));

    expect(result.current?.k).toBe(2);
  });

  it("should keep the same reference when k does not change between events", () => {
    const { result, fire } = setup();

    fire(zoomIdentity.scale(2));
    const afterFirst = result.current;
    fire(zoomIdentity.scale(2).translate(100, 50));

    expect(result.current).toBe(afterFirst);
  });

  it("should update the reference when k changes", () => {
    const { result, fire } = setup();

    fire(zoomIdentity.scale(2));
    const afterFirst = result.current;
    fire(zoomIdentity.scale(3));

    expect(result.current).not.toBe(afterFirst);
    expect(result.current?.k).toBe(3);
  });
});
