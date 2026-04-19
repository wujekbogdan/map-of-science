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
import LabelText from "../Label/LabelText.tsx";
import { ClusterDetails } from "./ClusterDetails.tsx";
import { type MapCluster } from "./ClusterShapes.tsx";
import Shape from "./Shape.tsx";

type Props = {
  cluster: MapCluster | null;
  label: { fontSize: number; opacity: number; offset: number };
  mode: "regular" | "growth";
  ripple: boolean;
  growthRatingColors: { start: RGB; middle: RGB; end: RGB };
};

const getLevelByArticlesCount = (articlesCount: number) => {
  if (articlesCount > 2000) return 1;
  if (articlesCount > 1000) return 2;
  if (articlesCount > 500) return 3;
  if (articlesCount > 200) return 4;
  if (articlesCount >= 50) return 5;
  return 6;
};

export const ClusterHoverOverlay = ({
  cluster,
  label,
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

  const showLabel = cluster.nameSource === "curated" && label.opacity > 0;

  return (
    <>
      <g
        ref={refs.setReference}
        data-cluster-id={cluster.id}
        pointerEvents="none"
      >
        <Shape
          progress={100}
          level={getLevelByArticlesCount(cluster.articlesCount)}
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
        {showLabel && (
          <LabelText
            id={cluster.id}
            x={cluster.position.x}
            y={cluster.position.y - label.offset}
            fontSize={label.fontSize}
            opacity={label.opacity}
            forcedHover={true}
            level={4}
          >
            {cluster.displayName}
          </LabelText>
        )}
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
