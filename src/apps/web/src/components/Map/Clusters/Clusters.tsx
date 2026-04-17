import {
  offset,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
  flip,
  shift,
} from "@floating-ui/react";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { RouterOutputs } from "../../../api-client/index.ts";
import { useArticleStore } from "../../../article/articleStore.ts";
import { useMapStore } from "../../../map/mapStore.ts";
import LabelText from "../Label/LabelText.tsx";
import { ClusterDetails } from "./ClusterDetails.tsx";
import Shape from "./Shape.tsx";
import css from "./clusters.module.scss";

type Mode = "growth" | "regular";
export type MapCluster = RouterOutputs["cluster"]["viewport"][number];

type Label = {
  fontSize: number;
  opacity: number;
  offset: number;
};

type Props = {
  clusters: MapCluster[];
  label: Label;
  ripple?: boolean;
  mode: Mode;
};

const getLevelByArticlesCount = (articlesCount: number) => {
  if (articlesCount > 2000) return 1;
  if (articlesCount > 1000) return 2;
  if (articlesCount > 500) return 3;
  if (articlesCount > 200) return 4;
  if (articlesCount >= 50) return 5;
  return 6;
};

const classes = (classList: string[]) => classList.join(" ");

const getPercentage = (index: number, total: number) =>
  Math.round(((index + 1) / total) * 100);

export const Clusters = ({ clusters, label, ripple, mode }: Props) => {
  const growthRatingColors = useMapStore((state) => state.growthRatingColors);
  const setRemoteArticleId = useArticleStore(
    (state) => state.setRemoteArticleId,
  );
  const [hoveredCluster, setHoveredCluster] = useState<MapCluster | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    middleware: [offset(10), flip(), shift({ padding: 10 })],
    open: isOpen,
    onOpenChange: setIsOpen,
  });
  const { isMounted, styles } = useTransitionStyles(context, {
    duration: { open: 300, close: 0 },
    initial: { opacity: 0 },
    open: { opacity: 1 },
  });
  const shouldCreatePortal = isMounted && hoveredCluster !== null;
  const hover = useHover(context, {
    delay: {
      open: 50,
      close: 0,
    },
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  return (
    <>
      {clusters.map((cluster, index) => {
        const isHovered = hoveredCluster?.id === cluster.id;
        const showLabel = cluster.nameSource === "curated" && label.opacity > 0;

        return (
          <g
            className={classes([css.group, css.fadeIn])}
            key={cluster.id}
            aria-label={cluster.displayName}
            ref={isHovered ? refs.setReference : null}
            onPointerEnter={() => {
              setHoveredCluster(cluster);
            }}
            onPointerLeave={() => {
              setHoveredCluster(null);
            }}
            onClick={() => {
              setRemoteArticleId(cluster.id);
            }}
            {...(isHovered ? getReferenceProps() : {})}
          >
            <Shape
              progress={getPercentage(index, clusters.length)}
              level={getLevelByArticlesCount(cluster.articlesCount)}
              point={{
                growthRating: cluster.growthRating,
                x: cluster.position.x,
                y: cluster.position.y,
              }}
              ripple={!!ripple}
              mode={mode}
              forcedHover={isHovered}
              growthRatingColors={growthRatingColors}
            />
            {showLabel && (
              <LabelText
                id={cluster.id}
                x={cluster.position.x}
                y={cluster.position.y - label.offset}
                fontSize={label.fontSize}
                opacity={label.opacity}
                forcedHover={isHovered}
                level={4}
              >
                {cluster.displayName}
              </LabelText>
            )}
          </g>
        );
      })}

      {shouldCreatePortal && (
        <>
          {createPortal(
            <div
              ref={refs.setFloating}
              style={{ ...floatingStyles, ...styles }}
              {...getFloatingProps()}
            >
              <ClusterDetails cluster={hoveredCluster} />
            </div>,
            document.body,
          )}
        </>
      )}
    </>
  );
};
