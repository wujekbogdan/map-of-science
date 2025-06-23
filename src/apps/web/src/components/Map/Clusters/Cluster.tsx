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
import { useShallow } from "zustand/react/shallow";
import { Concept, Cluster as Point } from "../../../api/model";
import { useArticleStore, useStore } from "../../../store.ts";
import { ClusterDetails } from "./ClusterDetails.tsx";
import Shape from "./Shape.tsx";
import css from "./clusters.module.scss";

type Mode = "growth" | "regular";

type Props = {
  concepts: Map<number, Concept>;
  uniformStyle?: boolean;
  clusters: Point[];
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

const getPercentage = (index: number, total: number) => {
  return Math.round(((index + 1) / total) * 100);
};

export const Cluster = ({ clusters, concepts, uniformStyle, mode }: Props) => {
  const [growthRatingColors] = useStore(
    useShallow((state) => [state.growthRatingColors]),
  );
  const setRemoteArticleId = useArticleStore(
    ({ setRemoteArticleId }) => setRemoteArticleId,
  );
  const [hoveredPoint, setHoveredCluster] = useState<Point | null>(null);
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
  const shouldCreatePortal = isMounted && hoveredPoint !== null;
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
        const label = concepts.get(cluster.clusterId)?.key;

        return (
          <g
            className={classes([css.group, css.fadeIn])}
            key={cluster.clusterId}
            aria-label={label}
            ref={
              hoveredPoint?.clusterId === cluster.clusterId
                ? refs.setReference
                : null
            }
            onPointerEnter={() => {
              setHoveredCluster(cluster);
            }}
            onPointerLeave={() => {
              setHoveredCluster(null);
            }}
            onClick={() => {
              setRemoteArticleId(cluster.clusterId);
            }}
            {...(hoveredPoint?.clusterId === cluster.clusterId
              ? getReferenceProps()
              : {})}
          >
            <Shape
              progress={getPercentage(index, clusters.length)}
              level={getLevelByArticlesCount(cluster.articlesCount)}
              point={{
                growthRating: cluster.growthRating,
                x: cluster.x,
                y: cluster.y,
              }}
              uniformStyle={!!uniformStyle}
              mode={mode}
              growthRatingColors={growthRatingColors}
            />
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
              <ClusterDetails cluster={hoveredPoint} concepts={concepts} />
            </div>,
            document.body,
          )}
        </>
      )}
    </>
  );
};
