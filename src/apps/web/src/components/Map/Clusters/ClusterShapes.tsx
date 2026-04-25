import { memo } from "react";
import type { RouterOutputs } from "../../../api-client/index.ts";
import type { RGB } from "../../../map/mapStore.ts";
import Shape from "./Shape.tsx";
import { getClusterLevel, type ArticleThresholds } from "./clusterLevel.ts";
import css from "./clusters.module.scss";

export type MapCluster = RouterOutputs["cluster"]["viewport"][number];

type Props = {
  clusters: MapCluster[];
  articleThresholds: ArticleThresholds;
  mode: "regular" | "growth";
  ripple: boolean;
  growthRatingColors: { start: RGB; middle: RGB; end: RGB };
  onHoveredClusterChange: (id: string | null) => void;
  onClusterClick: (id: string) => void;
};

const getPercentage = (index: number, total: number) =>
  Math.round(((index + 1) / total) * 100);

export const ClusterShapes = memo(function ClusterShapes({
  clusters,
  articleThresholds,
  mode,
  ripple,
  growthRatingColors,
  onHoveredClusterChange,
  onClusterClick,
}: Props) {
  return (
    <>
      {clusters.map((cluster, index) => (
        <g
          key={cluster.id}
          className={css.fadeIn}
          data-cluster-id={cluster.id}
          aria-label={cluster.displayName}
          onPointerEnter={() => {
            onHoveredClusterChange(cluster.id);
          }}
          onPointerLeave={() => {
            onHoveredClusterChange(null);
          }}
          onClick={() => {
            onClusterClick(cluster.id);
          }}
        >
          <Shape
            progress={getPercentage(index, clusters.length)}
            level={getClusterLevel(cluster.articlesCount, articleThresholds)}
            point={{
              growthRating: cluster.growthRating,
              x: cluster.position.x,
              y: cluster.position.y,
            }}
            ripple={ripple}
            mode={mode}
            forcedHover={false}
            growthRatingColors={growthRatingColors}
          />
        </g>
      ))}
    </>
  );
});
