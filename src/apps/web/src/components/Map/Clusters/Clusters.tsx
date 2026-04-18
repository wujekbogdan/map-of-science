import { useState } from "react";
import { useArticleStore } from "../../../article/articleStore.ts";
import { useMapStore } from "../../../map/mapStore.ts";
import { ClusterHoverOverlay } from "./ClusterHoverOverlay.tsx";
import { ClusterLabels } from "./ClusterLabels.tsx";
import { ClusterShapes, type MapCluster } from "./ClusterShapes.tsx";

type Props = {
  clusters: MapCluster[];
  label: { fontSize: number; opacity: number; offset: number };
  ripple?: boolean;
  mode: "regular" | "growth";
};

export const Clusters = ({ clusters, label, ripple, mode }: Props) => {
  const growthRatingColors = useMapStore((state) => state.growthRatingColors);
  const setRemoteArticleId = useArticleStore(
    (state) => state.setRemoteArticleId,
  );
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);
  const hoveredCluster = hoveredClusterId
    ? (clusters.find((cluster) => cluster.id === hoveredClusterId) ?? null)
    : null;

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
      <ClusterLabels clusters={clusters} label={label} />
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
