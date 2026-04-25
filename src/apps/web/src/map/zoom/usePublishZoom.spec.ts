import { renderHook } from "@testing-library/react";
import { zoomIdentity } from "d3";
import { afterEach, describe, expect, it } from "vitest";
import { useMapStore } from "../mapStore.ts";
import { usePublishZoom } from "./usePublishZoom.ts";

afterEach(() => {
  useMapStore.setState({ currentZoom: null });
});

describe("usePublishZoom", () => {
  it("should not write to the store when the transform is undefined", () => {
    renderHook(() => {
      usePublishZoom(undefined);
    });

    expect(useMapStore.getState().currentZoom).toBeNull();
  });

  it("should publish x, y and scale from the transform", () => {
    renderHook(() => {
      usePublishZoom(zoomIdentity.translate(100, 50).scale(2));
    });

    expect(useMapStore.getState().currentZoom).toEqual({
      x: 100,
      y: 50,
      scale: 2,
    });
  });

  it("should not republish when the transform reference is unchanged", () => {
    const transform = zoomIdentity.translate(100, 50).scale(2);
    const { rerender } = renderHook(
      (value: typeof transform | undefined) => {
        usePublishZoom(value);
      },
      { initialProps: transform },
    );

    const firstWrite = useMapStore.getState().currentZoom;
    rerender(transform);

    expect(useMapStore.getState().currentZoom).toBe(firstWrite);
  });
});
