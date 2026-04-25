import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { PlacedLabel } from "../../../map/labels/useLabelPlacement.ts";
import { ClusterLabels } from "./ClusterLabels.tsx";

const makeLabel = (overrides: Partial<PlacedLabel> = {}): PlacedLabel => ({
  id: "a",
  position: { x: 10, y: 100 },
  layout: { lines: ["Alpha"], widthAtRefFont: 30, heightAtRefFont: 11.5 },
  labelOffsetPx: 15,
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
        labels={[
          makeLabel({
            id: "a",
            position: { x: 10, y: 100 },
            labelOffsetPx: 15,
          }),
        ]}
        fontSize={12}
      />,
    );

    const textEl = container.querySelector("text");
    expect(textEl?.getAttribute("y")).toBe("100");
    expect(textEl?.getAttribute("dominant-baseline")).toBe("text-before-edge");

    const wrapperEl = textEl?.parentElement;
    expect(wrapperEl?.style.getPropertyValue("--label-offset-px")).toBe("15px");

    expect(queryByText("Alpha")).toBeTruthy();
  });

  it("should render a tspan per wrapped line", () => {
    const { queryByText } = renderInSvg(
      <ClusterLabels
        labels={[
          makeLabel({
            layout: {
              lines: ["Fundamental research", "in quantum"],
              widthAtRefFont: 120,
              heightAtRefFont: 23,
            },
          }),
        ]}
        fontSize={12}
      />,
    );

    expect(queryByText("Fundamental research")).toBeTruthy();
    expect(queryByText("in quantum")).toBeTruthy();
  });

  it("should render nothing when there are no labels", () => {
    const { container } = renderInSvg(
      <ClusterLabels labels={[]} fontSize={12} />,
    );

    expect(container.querySelector("text")).toBeNull();
  });
});
