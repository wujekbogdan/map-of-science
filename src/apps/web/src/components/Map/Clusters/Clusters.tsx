import type { ZoomTransform } from "d3";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useArticleStore } from "../../../article/articleStore.ts";
import { createLabelLayouter } from "../../../map/labels/createLabelLayouter.ts";
import { createSvgMeasureText } from "../../../map/labels/createSvgMeasureText.ts";
import { useLabelPlacement } from "../../../map/labels/useLabelPlacement.ts";
import { useMapStore } from "../../../map/mapStore.ts";
import { ClusterHoverOverlay } from "./ClusterHoverOverlay.tsx";
import { ClusterLabels } from "./ClusterLabels.tsx";
import { ClusterShapes, type MapCluster } from "./ClusterShapes.tsx";
import { toLabeledCluster } from "./clusterLevel.ts";

type Props = {
  clusters: MapCluster[];
  transform: ZoomTransform | undefined;
  ripple?: boolean;
  mode: "regular" | "growth";
};

export const Clusters = ({ clusters, transform, ripple, mode }: Props) => {
  const [
    growthRatingColors,
    fontSizeByLevel,
    articleThresholds,
    minZoomByLevel,
    maxLabels,
  ] = useMapStore(
    useShallow((state) => [
      state.growthRatingColors,
      state.clusterLabelFontSize,
      state.clusterLevelArticleThreshold,
      state.clusterLabelMinZoom,
      state.maxLabelsInViewport,
    ]),
  );
  const setRemoteArticleId = useArticleStore(
    (state) => state.setRemoteArticleId,
  );
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);
  const [dotEl, setDotEl] = useState<SVGGElement | null>(null);
  const [labelEl, setLabelEl] = useState<SVGGElement | null>(null);
  const hoveredCluster = hoveredClusterId
    ? (clusters.find((cluster) => cluster.id === hoveredClusterId) ?? null)
    : null;

  // Created once so the layout cache and the hidden measurement SVG survive
  // across renders; a fresh layouter would lose every measurement on every
  // pan/zoom and remount the SVG.
  const layouter = useMemo(
    () => createLabelLayouter({ measureText: createSvgMeasureText() }),
    [],
  );
  const zoomScale = transform?.k ?? 1;
  const labeledClusters = useMemo(
    () =>
      clusters.map((cluster) =>
        toLabeledCluster({
          cluster,
          articleThresholds,
          fontSizeByLevel,
          zoomScale,
        }),
      ),
    [clusters, fontSizeByLevel, articleThresholds, zoomScale],
  );
  const labels = useLabelPlacement({
    clusters: labeledClusters,
    transform,
    layouter,
    minZoomByLevel,
    maxLabels,
  });

  return (
    <>
      <ClusterShapes
        clusters={clusters}
        articleThresholds={articleThresholds}
        mode={mode}
        ripple={!!ripple}
        growthRatingColors={growthRatingColors}
        onHoveredClusterChange={setHoveredClusterId}
        onClusterClick={setRemoteArticleId}
        hoveredId={hoveredClusterId}
        onHoveredElChange={setDotEl}
      />
      <ClusterLabels
        labels={labels}
        zoomScale={zoomScale}
        hoveredId={hoveredClusterId}
        onHoveredClusterChange={setHoveredClusterId}
        onClusterClick={setRemoteArticleId}
        onHoveredElChange={setLabelEl}
      />
      <ClusterHoverOverlay
        cluster={hoveredCluster}
        dotEl={dotEl}
        labelEl={labelEl}
      />
    </>
  );
};

export type { MapCluster };
