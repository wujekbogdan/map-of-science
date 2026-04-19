import type { ZoomTransform } from "d3";
import { useEffect, type RefObject } from "react";

/* Converts a zoom transform to an SVG `transform` attribute string. */
export const transformAttr = (transform: ZoomTransform) => transform.toString();

type Subscribe = (fn: (transform: ZoomTransform) => void) => () => void;

/* Keeps an element's `transform` attribute in sync with the zoom. */
export const useZoomed = (
  subscribe: Subscribe,
  ref: RefObject<SVGGElement | null>,
) => {
  useEffect(() => {
    return subscribe((transform) => {
      ref.current?.setAttribute("transform", transformAttr(transform));
    });
  }, [subscribe, ref]);
};
