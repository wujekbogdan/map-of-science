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
import { Concept, DataPoint as Point } from "../../../api/model";
import { useArticleStore, useStore } from "../../../store.ts";
import { DataPointDetails } from "./DataPointDetails.tsx";
import css from "./DataPoints.module.scss";
import Shape from "./Shape.tsx";

type Mode = "growth" | "regular";

type Props = {
  concepts: Map<number, Concept>;
  uniformStyle?: boolean;
  points: Point[];
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

export const DataPoints = ({ points, concepts, uniformStyle, mode }: Props) => {
  const [growthRatingColors] = useStore(
    useShallow((state) => [state.growthRatingColors]),
  );
  const setRemoteArticleId = useArticleStore(
    ({ setRemoteArticleId }) => setRemoteArticleId,
  );
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
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
      {points.map((point) => {
        const label = concepts.get(point.clusterId)?.key;

        return (
          <g
            className={classes([css.group, css.fadeIn])}
            key={point.clusterId}
            aria-label={label}
            ref={
              hoveredPoint?.clusterId === point.clusterId
                ? refs.setReference
                : null
            }
            onPointerEnter={() => {
              setHoveredPoint(point);
            }}
            onPointerLeave={() => {
              setHoveredPoint(null);
            }}
            onClick={() => {
              setRemoteArticleId(point.clusterId);
            }}
            {...(hoveredPoint?.clusterId === point.clusterId
              ? getReferenceProps()
              : {})}
          >
            <Shape
              level={getLevelByArticlesCount(point.numRecentArticles)}
              point={{
                growthRating: point.growthRating,
                x: point.x,
                y: point.y,
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
              <DataPointDetails point={hoveredPoint} concepts={concepts} />
            </div>,
            document.body,
          )}
        </>
      )}
    </>
  );
};
