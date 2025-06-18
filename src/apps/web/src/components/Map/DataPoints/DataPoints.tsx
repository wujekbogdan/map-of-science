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
import { useArticleStore, useStore, RGB } from "../../../store.ts";
import { DataPointDetails } from "./DataPointDetails.tsx";
import css from "./DataPoints.module.scss";

type Mode = "growth" | "regular";

type Props = {
  concepts: Map<number, Concept>;
  forcedSize?: boolean;
  points: Point[];
  mode: Mode;
};

const configByThreshold = [
  { min: 2001, level: 1 },
  { min: 1001, level: 2 },
  { min: 501, level: 3 },
  { min: 201, level: 4 },
  { min: 51, level: 5 },
  { min: 0, level: 6 },
] as const;

type ShapeOptions = {
  point: Point;
  forcedSize: boolean;
  mode: Mode;
  growthRatingColors: {
    start: RGB;
    middle: RGB;
    end: RGB;
  };
};

const classes = (classList: string[]) => classList.join(" ");

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const interpolateColor = (c1: RGB, c2: RGB, t: number): RGB => ({
  r: Math.round(lerp(c1.r, c2.r, t)),
  g: Math.round(lerp(c1.g, c2.g, t)),
  b: Math.round(lerp(c1.b, c2.b, t)),
});

const getGradientColor = (
  growthRating: number,
  colors: {
    start: RGB;
    middle: RGB;
    end: RGB;
  },
) => {
  const t = growthRating / 100;
  const [from, to, localT] =
    t < 0.5
      ? [colors.start, colors.middle, t * 2]
      : [colors.middle, colors.end, (t - 0.5) * 2];

  const rgb = interpolateColor(from, to, localT);
  return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
};

const Shape = (options: ShapeOptions) => {
  const { point, forcedSize, mode, growthRatingColors } = options;
  const { x, y } = point;
  const config = configByThreshold.find(
    ({ min }) => point.numRecentArticles >= min,
  );
  const level =
    config?.level ?? configByThreshold[configByThreshold.length - 1].level;
  const colorClass = mode === "regular" ? css.circleRegular : "";

  const classList = forcedSize
    ? [
        css.circle,
        colorClass,
        css[`level-${level.toString()}`],
        css.searchResults,
      ]
    : [css.circle, colorClass, css[`level-${level.toString()}`]];

  const style =
    mode === "growth"
      ? { fill: getGradientColor(point.growthRating, growthRatingColors) }
      : undefined;
  return <circle className={classes(classList)} cx={x} cy={y} style={style} />;
};

export const DataPoints = ({ points, concepts, forcedSize, mode }: Props) => {
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
              point={point}
              forcedSize={!!forcedSize}
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
