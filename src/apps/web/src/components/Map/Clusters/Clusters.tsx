import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useNavigateToCluster } from "../../../cluster/useNavigateToCluster.ts";
import { createLabelLayouter } from "../../../map/labels/createLabelLayouter.ts";
import { createSvgMeasureText } from "../../../map/labels/createSvgMeasureText.ts";
import { useLabelPlacement } from "../../../map/labels/useLabelPlacement.ts";
import { useMapStore } from "../../../map/mapStore.ts";
import { useSelectionStore } from "../../../map/selectionStore.ts";
import { useMapViewIsSettled } from "../../../map/view/hooks.ts";
import type { Transform } from "../../../map/view/transform.ts";
import { ClusterHoverOverlay } from "./ClusterHoverOverlay.tsx";
import { ClusterLabels } from "./ClusterLabels.tsx";
import { ClusterShapes, type MapCluster } from "./ClusterShapes.tsx";
import { toLabeledCluster } from "./clusterLevel.ts";
import { useHoverIntent } from "./useHoverIntent.ts";

const HOVER_DWELL_MS = 150;

type Props = {
  clusters: MapCluster[];
  transform: Transform | undefined;
  ripplingIds: Set<string>;
  highlightedIds: Set<string>;
  mode: "regular" | "growth";
};

export const Clusters = ({
  clusters,
  transform,
  ripplingIds,
  highlightedIds,
  mode,
}: Props) => {
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
  const navigateToCluster = useNavigateToCluster();
  const onClusterClick = (id: string) => {
    void navigateToCluster(id, { fromMap: true });
  };
  const searchHoveredClusterId = useSelectionStore(
    (state) => state.searchHoveredClusterId,
  );
  const [rawHoveredClusterId, setRawHoveredClusterId] = useState<string | null>(
    null,
  );
  const [dotEl, setDotEl] = useState<SVGGElement | null>(null);
  const [labelEl, setLabelEl] = useState<SVGGElement | null>(null);
  const isSettled = useMapViewIsSettled();
  const intentHoveredClusterId = useHoverIntent(
    rawHoveredClusterId,
    HOVER_DWELL_MS,
  );
  // Pointer hover wins over search-driven hover when both are set, so direct map interaction is never overridden by the dropdown's focused-option preview. Pointer hover is gated by the settle flag to suppress flicker during zoom and pan; search-driven hover is not, because it reflects an explicit user choice.
  const highlightedClusterId =
    (isSettled ? rawHoveredClusterId : null) ?? searchHoveredClusterId;
  const popoverAnchorClusterId = isSettled ? intentHoveredClusterId : null;
  const popoverCluster = popoverAnchorClusterId
    ? (clusters.find((cluster) => cluster.id === popoverAnchorClusterId) ??
      null)
    : null;

  // Created once so the layout cache and the hidden measurement SVG survive
  // across renders; a fresh layouter would lose every measurement on every
  // pan/zoom and remount the SVG.
  const layouter = useMemo(
    () => createLabelLayouter({ measureText: createSvgMeasureText() }),
    [],
  );
  const zoomScale = transform?.scale ?? 1;
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
        ripplingIds={ripplingIds}
        highlightedIds={highlightedIds}
        growthRatingColors={growthRatingColors}
        onHoveredClusterChange={setRawHoveredClusterId}
        onClusterClick={onClusterClick}
        hoveredId={highlightedClusterId}
        popoverAnchorId={popoverAnchorClusterId}
        onHoveredElChange={setDotEl}
      />
      <ClusterLabels
        labels={labels}
        zoomScale={zoomScale}
        hoveredId={highlightedClusterId}
        popoverAnchorId={popoverAnchorClusterId}
        onHoveredClusterChange={setRawHoveredClusterId}
        onClusterClick={onClusterClick}
        onHoveredElChange={setLabelEl}
      />
      <ClusterHoverOverlay
        cluster={popoverCluster}
        dotEl={dotEl}
        labelEl={labelEl}
      />
    </>
  );
};

export type { MapCluster };
