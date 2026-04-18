import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClusterShapes, type MapCluster } from "./ClusterShapes.tsx";

const makeCluster = (overrides: Partial<MapCluster> = {}): MapCluster => ({
  id: "cluster-1",
  externalId: 1,
  position: { x: 10, y: 20 },
  name: "Black Holes",
  displayName: "Black Holes",
  nameSource: "curated",
  articlesCount: 100,
  growthRating: 50,
  embedding: { model: "test", source: "titles" },
  keyConcepts: [],
  ...overrides,
});

const growthRatingColors = {
  start: { r: 0, g: 0, b: 0 },
  middle: { r: 128, g: 128, b: 128 },
  end: { r: 255, g: 255, b: 255 },
};

const renderInSvg = (ui: React.ReactNode) =>
  render(
    <svg>
      <g>{ui}</g>
    </svg>,
  );

afterEach(() => {
  cleanup();
});

describe("ClusterShapes", () => {
  it("should fire hover and click callbacks with the targeted cluster id", () => {
    const onHoveredClusterChange = vi.fn();
    const onClusterClick = vi.fn();
    const clusters = [
      makeCluster({ id: "a" }),
      makeCluster({ id: "b", position: { x: 30, y: 40 } }),
    ];

    const { container } = renderInSvg(
      <ClusterShapes
        clusters={clusters}
        mode="regular"
        ripple={false}
        growthRatingColors={growthRatingColors}
        onHoveredClusterChange={onHoveredClusterChange}
        onClusterClick={onClusterClick}
      />,
    );

    const target = container.querySelector('[data-cluster-id="b"]');
    expect(target).toBeTruthy();

    fireEvent.pointerEnter(target!);
    expect(onHoveredClusterChange).toHaveBeenNthCalledWith(1, "b");
    fireEvent.pointerLeave(target!);
    expect(onHoveredClusterChange).toHaveBeenNthCalledWith(2, null);
    expect(onHoveredClusterChange).toHaveBeenCalledTimes(2);

    fireEvent.click(target!);
    expect(onClusterClick).toHaveBeenNthCalledWith(1, "b");
    expect(onClusterClick).toHaveBeenCalledTimes(1);
  });
});
