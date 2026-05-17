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
  it("should render an extra ripple circle only for clusters in ripplingIds", () => {
    const clusters = [
      makeCluster({ id: "a" }),
      makeCluster({ id: "b", position: { x: 30, y: 40 } }),
    ];

    const { container } = renderInSvg(
      <ClusterShapes
        clusters={clusters}
        articleThresholds={{ 1: 2000, 2: 1000, 3: 500, 4: 200, 5: 50 }}
        mode="regular"
        ripplingIds={new Set(["b"])}
        viewedClusterId={null}
        growthRatingColors={growthRatingColors}
        onHoveredClusterChange={vi.fn()}
        onClusterClick={vi.fn()}
      />,
    );

    const groupA = container.querySelector('[data-test-cluster-id="a"]');
    const groupB = container.querySelector('[data-test-cluster-id="b"]');
    expect(groupA?.querySelectorAll("circle")).toHaveLength(1);
    expect(groupB?.querySelectorAll("circle")).toHaveLength(2);
  });

  it("should render an extra halo circle only for the viewed cluster", () => {
    const clusters = [
      makeCluster({ id: "a" }),
      makeCluster({ id: "b", position: { x: 30, y: 40 } }),
    ];

    const { container } = renderInSvg(
      <ClusterShapes
        clusters={clusters}
        articleThresholds={{ 1: 2000, 2: 1000, 3: 500, 4: 200, 5: 50 }}
        mode="regular"
        ripplingIds={new Set()}
        viewedClusterId="b"
        growthRatingColors={growthRatingColors}
        onHoveredClusterChange={vi.fn()}
        onClusterClick={vi.fn()}
      />,
    );

    const groupA = container.querySelector('[data-test-cluster-id="a"]');
    const groupB = container.querySelector('[data-test-cluster-id="b"]');
    expect(groupA?.querySelectorAll("circle")).toHaveLength(1);
    expect(groupB?.querySelectorAll("circle")).toHaveLength(2);
  });

  it("should render no halo circle when there is no viewed cluster", () => {
    const clusters = [
      makeCluster({ id: "a" }),
      makeCluster({ id: "b", position: { x: 30, y: 40 } }),
    ];

    const { container } = renderInSvg(
      <ClusterShapes
        clusters={clusters}
        articleThresholds={{ 1: 2000, 2: 1000, 3: 500, 4: 200, 5: 50 }}
        mode="regular"
        ripplingIds={new Set()}
        viewedClusterId={null}
        growthRatingColors={growthRatingColors}
        onHoveredClusterChange={vi.fn()}
        onClusterClick={vi.fn()}
      />,
    );

    const groupA = container.querySelector('[data-test-cluster-id="a"]');
    const groupB = container.querySelector('[data-test-cluster-id="b"]');
    expect(groupA?.querySelectorAll("circle")).toHaveLength(1);
    expect(groupB?.querySelectorAll("circle")).toHaveLength(1);
  });

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
        articleThresholds={{ 1: 2000, 2: 1000, 3: 500, 4: 200, 5: 50 }}
        mode="regular"
        ripplingIds={new Set()}
        viewedClusterId={null}
        growthRatingColors={growthRatingColors}
        onHoveredClusterChange={onHoveredClusterChange}
        onClusterClick={onClusterClick}
      />,
    );

    const target = container.querySelector('[data-test-cluster-id="b"]');
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

  it("should capture the hovered cluster's element via onHoveredElChange", () => {
    const onHoveredElChange = vi.fn();
    const clusters = [
      makeCluster({ id: "a" }),
      makeCluster({ id: "b", position: { x: 30, y: 40 } }),
    ];

    const { container } = renderInSvg(
      <ClusterShapes
        clusters={clusters}
        articleThresholds={{ 1: 2000, 2: 1000, 3: 500, 4: 200, 5: 50 }}
        mode="regular"
        ripplingIds={new Set()}
        viewedClusterId={null}
        growthRatingColors={growthRatingColors}
        onHoveredClusterChange={vi.fn()}
        onClusterClick={vi.fn()}
        popoverAnchorId="b"
        onHoveredElChange={onHoveredElChange}
      />,
    );

    const target = container.querySelector('[data-test-cluster-id="b"]');
    expect(onHoveredElChange).toHaveBeenCalledTimes(1);
    expect(onHoveredElChange).toHaveBeenCalledWith(target);
  });

  it("should clear the previous element and capture the new one when popoverAnchorId changes", () => {
    const onHoveredElChange = vi.fn();
    const clusters = [
      makeCluster({ id: "a" }),
      makeCluster({ id: "b", position: { x: 30, y: 40 } }),
    ];
    const baseProps = {
      clusters,
      articleThresholds: { 1: 2000, 2: 1000, 3: 500, 4: 200, 5: 50 } as const,
      mode: "regular" as const,
      ripplingIds: new Set<string>(),
      viewedClusterId: null,
      growthRatingColors,
      onHoveredClusterChange: vi.fn(),
      onClusterClick: vi.fn(),
      onHoveredElChange,
    };

    const { container, rerender } = renderInSvg(
      <ClusterShapes {...baseProps} popoverAnchorId="a" />,
    );
    const elA = container.querySelector('[data-test-cluster-id="a"]');
    onHoveredElChange.mockClear();

    rerender(
      <svg>
        <g>
          <ClusterShapes {...baseProps} popoverAnchorId="b" />
        </g>
      </svg>,
    );
    const elB = container.querySelector('[data-test-cluster-id="b"]');

    const firstArgs = onHoveredElChange.mock.calls.map(
      (args: unknown[]) => args[0],
    );
    expect(firstArgs).toEqual([null, elB]);
    expect(elA).toBeTruthy();
  });
});
