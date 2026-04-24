import type { ZoomTransform } from "d3";
import { useMemo, useState } from "react";
import { useArticleStore } from "../../../article/articleStore.ts";
import { createLabelLayouter } from "../../../map/labels/createLabelLayouter.ts";
import { createSvgMeasureText } from "../../../map/labels/createSvgMeasureText.ts";
import { useLabelPlacement } from "../../../map/labels/useLabelPlacement.ts";
import { useMapStore } from "../../../map/mapStore.ts";
import { ClusterHoverOverlay } from "./ClusterHoverOverlay.tsx";
import { ClusterLabels } from "./ClusterLabels.tsx";
import { ClusterShapes, type MapCluster } from "./ClusterShapes.tsx";

type Props = {
  clusters: MapCluster[];
  label: { fontSize: number; offset: number };
  transform: ZoomTransform | undefined;
  ripple?: boolean;
  mode: "regular" | "growth";
};

export const Clusters = ({
  clusters,
  label,
  transform,
  ripple,
  mode,
}: Props) => {
  const growthRatingColors = useMapStore((state) => state.growthRatingColors);
  const setRemoteArticleId = useArticleStore(
    (state) => state.setRemoteArticleId,
  );
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);
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
  const labels = useLabelPlacement({
    clusters,
    transform,
    fontSize: label.fontSize,
    offset: label.offset,
    layouter,
  });

  return (
    <>
      <ClusterShapes
        clusters={clusters}
        mode={mode}
        ripple={!!ripple}
        growthRatingColors={growthRatingColors}
        onHoveredClusterChange={setHoveredClusterId}
        onClusterClick={setRemoteArticleId}
      />
      <ClusterLabels
        labels={labels}
        fontSize={label.fontSize}
        offset={label.offset}
      />
      <ClusterHoverOverlay
        cluster={hoveredCluster}
        label={label}
        mode={mode}
        ripple={!!ripple}
        growthRatingColors={growthRatingColors}
      />
    </>
  );
};

export type { MapCluster };
