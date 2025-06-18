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
import { Concept, DataPoint as Point } from "../../../api/model";
import { useArticleStore } from "../../../store.ts";
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
};

const classes = (classList: string[]) => classList.join(" ");

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const interpolateColor = (c1: number[], c2: number[], t: number) =>
  c1.map((v, i) => Math.round(lerp(v, c2[i], t)));

const getGradientColor = (
  value: number,
  start: number[],
  middle: number[],
  end: number[],
) => {
  const t = value / 100;
  const [from, to, localT] =
    t < 0.5 ? [start, middle, t * 2] : [middle, end, (t - 0.5) * 2];

  const color = interpolateColor(from, to, localT);
  return `rgb(${color.join(",")})`;
};

const Shape = (options: ShapeOptions) => {
  const { point, forcedSize, mode } = options;
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

  const start = [0, 0, 255];
  const middle = [255, 255, 255];
  const end = [255, 0, 0];

  const style =
    mode === "growth"
      ? { fill: getGradientColor(point.growthRating, start, middle, end) }
      : undefined;
  return <circle className={classes(classList)} cx={x} cy={y} style={style} />;
};

export const DataPoints = ({ points, concepts, forcedSize, mode }: Props) => {
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
            <Shape point={point} forcedSize={!!forcedSize} mode={mode} />
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
