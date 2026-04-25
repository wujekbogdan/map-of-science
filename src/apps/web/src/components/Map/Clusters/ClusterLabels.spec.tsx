import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LABEL_DOT_GAP_PX } from "../../../map/labels/config.ts";
import type { PlacedLabel } from "../../../map/labels/useLabelPlacement.ts";
import { ClusterLabels } from "./ClusterLabels.tsx";

const makeLabel = (overrides: Partial<PlacedLabel> = {}): PlacedLabel => ({
  id: "a",
  position: { x: 10, y: 100 },
  layout: { lines: ["Alpha"], widthAtRefFont: 30, heightAtRefFont: 11.5 },
  labelOffsetPx: 15,
  fontSize: 12,
  ...overrides,
});

const renderInSvg = (ui: React.ReactNode) =>
  render(
    <svg>
      <g>{ui}</g>
    </svg>,
  );

afterEach(() => {
  cleanup();
});

describe("ClusterLabels", () => {
  it("should anchor the text at the cluster position and expose the screen-space offset as a CSS variable", () => {
    const { container, queryByText } = renderInSvg(
      <ClusterLabels
        zoomScale={1}
        labels={[
          makeLabel({
            id: "a",
            position: { x: 10, y: 100 },
            labelOffsetPx: 15,
          }),
        ]}
      />,
    );

    const textEl = container.querySelector("text");
    expect(textEl?.getAttribute("y")).toBe("100");
    expect(textEl?.getAttribute("dominant-baseline")).toBe("text-before-edge");

    const wrapperEl = textEl?.parentElement;
    expect(wrapperEl?.style.getPropertyValue("--label-offset-px")).toBe("15px");

    expect(queryByText("Alpha")).toBeTruthy();
  });

  it("should set each label's font size inline so it can vary per cluster", () => {
    const { container } = renderInSvg(
      <ClusterLabels
        zoomScale={1}
        labels={[
          makeLabel({ id: "big", fontSize: 16 }),
          makeLabel({
            id: "small",
            position: { x: 50, y: 200 },
            fontSize: 6,
          }),
        ]}
      />,
    );

    const sizes = [...container.querySelectorAll("text")].map(
      (el) => el.style.fontSize,
    );

    expect(sizes).toEqual(["16px", "6px"]);
  });

  it("should render a tspan per wrapped line", () => {
    const { queryByText } = renderInSvg(
      <ClusterLabels
        zoomScale={1}
        labels={[
          makeLabel({
            layout: {
              lines: ["Fundamental research", "in quantum"],
              widthAtRefFont: 120,
              heightAtRefFont: 23,
            },
          }),
        ]}
      />,
    );

    expect(queryByText("Fundamental research")).toBeTruthy();
    expect(queryByText("in quantum")).toBeTruthy();
  });

  it("should render nothing when there are no labels", () => {
    const { container } = renderInSvg(
      <ClusterLabels labels={[]} zoomScale={1} />,
    );

    expect(container.querySelector("text")).toBeNull();
  });

  it("should render a connector line whose length and stroke width scale inversely with zoom so they stay constant in screen pixels", () => {
    const { container } = renderInSvg(
      <ClusterLabels
        zoomScale={10}
        labels={[makeLabel({ id: "a", position: { x: 10, y: 100 } })]}
      />,
    );

    const line = container.querySelector("line");
    expect(line?.getAttribute("x1")).toBe("10");
    expect(line?.getAttribute("x2")).toBe("10");
    expect(line?.getAttribute("y2")).toBe("100");
    expect(line?.getAttribute("y1")).toBe(
      (100 - LABEL_DOT_GAP_PX / 10).toString(),
    );
    expect(line?.getAttribute("stroke-width")).toBe((1 / 10).toString());
  });

  it("should report hover and click against the cluster id", () => {
    const onHoveredClusterChange = vi.fn();
    const onClusterClick = vi.fn();
    const { container } = renderInSvg(
      <ClusterLabels
        zoomScale={1}
        labels={[makeLabel({ id: "a" })]}
        onHoveredClusterChange={onHoveredClusterChange}
        onClusterClick={onClusterClick}
      />,
    );
    const group = container.querySelector("text")!.parentElement!;

    fireEvent.pointerEnter(group);
    fireEvent.pointerLeave(group);
    fireEvent.click(group);

    expect(onHoveredClusterChange.mock.calls).toEqual([["a"], [null]]);
    expect(onClusterClick).toHaveBeenCalledWith("a");
  });
});
