/*
 * Paints the background SVG on the map's root <svg>, kept aligned with
 * the panned/zoomed foreground.
 *
 * The background moves with the same transform as the <g> holding the
 * data points, and that transform updates at pointer-event rate. The
 * per-tick write therefore goes through the DOM rather than React state
 * - see useD3Zoom for the rationale. This hook is the consumer side of
 * that imperative path: pass the zoom source's `subscribe`, and the hook
 * mutates svg.style on each tick.
 *
 * The computation is kept separate from the application. `backgroundStyle`
 * is a pure function that returns the style values; the subscriber merely
 * copies them onto the element. That way the math is easy to read and
 * testable without touching the DOM.
 */
import type { ZoomTransform } from "d3";
import { useEffect, type RefObject } from "react";
import type { ZoomSubscribe } from "./useD3Zoom.ts";

type Options = {
  mapSvgUrl: string | undefined;
  svgScaleFactor: number;
  svgOffset: { x: number; y: number };
};

// TODO: parse the viewBox from the SVG instead of hardcoding.
const VIEW_BOX = { width: 18340.723, height: 18561.087 };

const staticStyle = (mapSvgUrl: string) =>
  ({
    backgroundImage: `url(${mapSvgUrl})`,
    backgroundRepeat: "no-repeat",
  }) as const;

const backgroundStyle = (
  transform: ZoomTransform,
  svgScaleFactor: number,
  svgOffset: { x: number; y: number },
) => {
  const scale = svgScaleFactor * transform.k;
  const scaledWidth = VIEW_BOX.width * scale;
  const scaledHeight = VIEW_BOX.height * scale;
  const bgX = transform.x + svgOffset.x * transform.k - scaledWidth / 2;
  const bgY = transform.y + svgOffset.y * transform.k - scaledHeight / 2;
  return {
    backgroundSize: `${scaledWidth.toString()}px ${scaledHeight.toString()}px`,
    backgroundPosition: `${bgX.toString()}px ${bgY.toString()}px`,
  } as const;
};

export const useMapBackground = (
  svg: RefObject<SVGSVGElement | null>,
  subscribe: ZoomSubscribe,
  { mapSvgUrl, svgScaleFactor, svgOffset }: Options,
) => {
  useEffect(() => {
    const element = svg.current;
    if (!element || !mapSvgUrl) return;
    Object.assign(element.style, staticStyle(mapSvgUrl));
  }, [svg, mapSvgUrl]);

  useEffect(() => {
    if (!mapSvgUrl) return;
    return subscribe((transform) => {
      const element = svg.current;
      if (!element) return;
      Object.assign(
        element.style,
        backgroundStyle(transform, svgScaleFactor, svgOffset),
      );
    });
  }, [svg, subscribe, mapSvgUrl, svgScaleFactor, svgOffset.x, svgOffset.y]);
};

export { backgroundStyle };
