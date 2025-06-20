import { RGB } from "../../../store.ts";
import css from "./DataPoints.module.scss";

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

const classes = (classList: string[]) => classList.join(" ");

type Mode = "growth" | "regular";

type ShapeOptions = {
  point: {
    growthRating: number;
    x: number;
    y: number;
  };
  uniformStyle: boolean;
  mode: Mode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  growthRatingColors: {
    start: RGB;
    middle: RGB;
    end: RGB;
  };
};

export const Shape = (options: ShapeOptions) => {
  const { point, uniformStyle, mode, growthRatingColors, level } = options;
  const { x, y } = point;
  const colorClasses =
    mode === "regular" ? [css.outline, css.fill] : css.outline;
  const sizeClass = css[`level-${level.toString()}`];
  const classList = uniformStyle
    ? [css.circle, ...colorClasses, sizeClass, css.searchResults]
    : [css.circle, ...colorClasses, sizeClass];

  // TODO: It might be more efficient to simply precalculate 100 CSS classes with SCSS
  const style =
    mode === "growth"
      ? { fill: getGradientColor(point.growthRating, growthRatingColors) }
      : undefined;

  return (
    <>
      {uniformStyle && (
        <circle className={css.ripple} cx={x} cy={y} style={style} />
      )}
      <circle className={classes(classList)} cx={x} cy={y} style={style} />
    </>
  );
};

export default Shape;
