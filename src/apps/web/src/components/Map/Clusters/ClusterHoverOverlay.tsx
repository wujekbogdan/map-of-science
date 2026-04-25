import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  useTransitionStyles,
} from "@floating-ui/react";
import { createPortal } from "react-dom";
import type { RGB } from "../../../map/mapStore.ts";
import { ClusterDetails } from "./ClusterDetails.tsx";
import { type MapCluster } from "./ClusterShapes.tsx";
import Shape from "./Shape.tsx";
import { getClusterLevel } from "./clusterLevel.ts";

type Props = {
  cluster: MapCluster | null;
  mode: "regular" | "growth";
  ripple: boolean;
  growthRatingColors: { start: RGB; middle: RGB; end: RGB };
};

export const ClusterHoverOverlay = ({
  cluster,
  mode,
  ripple,
  growthRatingColors,
}: Props) => {
  const isOpen = cluster !== null;
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    middleware: [offset(10), flip(), shift({ padding: 10 })],
    whileElementsMounted: autoUpdate,
  });
  const { isMounted, styles } = useTransitionStyles(context, {
    duration: { open: 300, close: 0 },
    initial: { opacity: 0 },
    open: { opacity: 1 },
  });

  if (!cluster) return null;

  return (
    <>
      <g
        ref={refs.setReference}
        data-cluster-id={cluster.id}
        pointerEvents="none"
      >
        <Shape
          progress={100}
          level={getClusterLevel(cluster.articlesCount)}
          point={{
            growthRating: cluster.growthRating,
            x: cluster.position.x,
            y: cluster.position.y,
          }}
          ripple={ripple}
          mode={mode}
          forcedHover={true}
          growthRatingColors={growthRatingColors}
        />
      </g>
      {isMounted &&
        createPortal(
          <div ref={refs.setFloating} style={{ ...floatingStyles, ...styles }}>
            <ClusterDetails cluster={cluster} />
          </div>,
          document.body,
        )}
    </>
  );
};
