import { zoomIdentity } from "d3";
import { useMemo } from "react";
import type { CSSProperties } from "react";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { LABEL_DOT_GAP_PX } from "../../../map/labels/config.ts";
import { createLabelLayouter } from "../../../map/labels/createLabelLayouter.ts";
import { createSvgMeasureText } from "../../../map/labels/createSvgMeasureText.ts";
import { useLabelPlacement } from "../../../map/labels/useLabelPlacement.ts";
import { ClusterLabels } from "./ClusterLabels.tsx";
import { CLUSTER_DOT_RADII_PX, getClusterLevel } from "./clusterLevel.ts";
import css from "./clusters.module.scss";

type HarnessCluster = {
  id: string;
  displayName: string;
  position: { x: number; y: number };
  articlesCount: number;
};

const SVG_SIZE = 1000;

const LabelsHarness = ({
  zoomScale,
  clusters,
}: {
  zoomScale: number;
  clusters: HarnessCluster[];
}) => {
  const layouter = useMemo(
    () => createLabelLayouter({ measureText: createSvgMeasureText() }),
    [],
  );
  const labelInputs = useMemo(
    () =>
      clusters.map((cluster) => ({
        id: cluster.id,
        displayName: cluster.displayName,
        position: cluster.position,
        labelOffsetPx:
          CLUSTER_DOT_RADII_PX[getClusterLevel(cluster.articlesCount)] +
          LABEL_DOT_GAP_PX,
      })),
    [clusters],
  );
  const labels = useLabelPlacement({
    clusters: labelInputs,
    transform: zoomIdentity.scale(zoomScale),
    fontSize: 12,
    layouter,
  });

  return (
    <svg
      data-testid="map"
      width={SVG_SIZE}
      height={SVG_SIZE}
      viewBox={`0 0 ${SVG_SIZE.toString()} ${SVG_SIZE.toString()}`}
      style={{ "--zoom-scale": zoomScale } as CSSProperties}
    >
      <g transform={`scale(${zoomScale.toString()})`}>
        {clusters.map((cluster) => (
          <circle
            key={`${cluster.id}-dot`}
            data-testid={`${cluster.id}-dot`}
            cx={cluster.position.x}
            cy={cluster.position.y}
            className={
              css[`level-${getClusterLevel(cluster.articlesCount).toString()}`]
            }
            fill="black"
          />
        ))}
        <ClusterLabels labels={labels} fontSize={12} />
      </g>
    </svg>
  );
};

const alpha = (overrides: Partial<HarnessCluster> = {}): HarnessCluster => ({
  id: "a",
  displayName: "Alpha",
  position: { x: 100, y: 100 },
  articlesCount: 5000,
  ...overrides,
});

describe("ClusterLabels in a browser-rendered SVG", () => {
  it("should render a label for a cluster above the zoom threshold", async () => {
    const { container } = await render(
      <LabelsHarness zoomScale={10} clusters={[alpha()]} />,
    );

    const texts = container.querySelectorAll("text");
    expect(texts.length).toBe(1);
    expect(texts[0]?.textContent).toBe("Alpha");
  });

  it("should render no labels below the zoom threshold", async () => {
    const { container } = await render(
      <LabelsHarness zoomScale={1} clusters={[alpha()]} />,
    );

    expect(container.querySelectorAll("text").length).toBe(0);
  });

  it("should drop the lower-priority label when two clusters occupy the same position", async () => {
    const { container } = await render(
      <LabelsHarness
        zoomScale={10}
        clusters={[
          alpha({ id: "a", displayName: "Alpha", articlesCount: 5000 }),
          alpha({ id: "b", displayName: "Bravo", articlesCount: 1000 }),
        ]}
      />,
    );

    const texts = container.querySelectorAll("text");
    expect(texts.length).toBe(1);
    expect(texts[0]?.textContent).toBe("Alpha");
  });

  it("should keep a constant screen-pixel gap between the dot and the label across zoom levels", async () => {
    const measureGap = (container: Element) => {
      const dotRect = container
        .querySelector(`[data-testid="a-dot"]`)!
        .getBoundingClientRect();
      const textRect = container.querySelector("text")!.getBoundingClientRect();
      const dotCenterY = dotRect.top + dotRect.height / 2;
      return Math.round(textRect.top - dotCenterY);
    };

    const atZoom10 = await render(
      <LabelsHarness zoomScale={10} clusters={[alpha()]} />,
    );
    const gap10 = measureGap(atZoom10.container);
    void atZoom10.unmount();

    const atZoom20 = await render(
      <LabelsHarness zoomScale={20} clusters={[alpha()]} />,
    );
    const gap20 = measureGap(atZoom20.container);

    expect({ gap10, gap20 }).toEqual({ gap10: 22, gap20: 22 });
  });
});
