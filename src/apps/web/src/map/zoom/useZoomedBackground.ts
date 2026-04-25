import type { ZoomTransform } from "d3";
import { useEffect, type RefObject } from "react";

// TODO: parse from the SVG instead of hardcoding.
const VIEW_BOX = { width: 18340.723, height: 18561.087 };

export type ZoomedBackgroundConfig = {
  imageUrl: string | undefined;
  scaleFactor: number;
  offset: { x: number; y: number };
};

export const backgroundStyle = (
  transform: ZoomTransform,
  scaleFactor: number,
  offset: { x: number; y: number },
) => {
  const scale = scaleFactor * transform.k;
  const width = VIEW_BOX.width * scale;
  const height = VIEW_BOX.height * scale;
  const positionX = transform.x + offset.x * transform.k - width / 2;
  const positionY = transform.y + offset.y * transform.k - height / 2;
  return {
    backgroundSize: `${width.toString()}px ${height.toString()}px`,
    backgroundPosition: `${positionX.toString()}px ${positionY.toString()}px`,
  };
};

type Subscribe = (fn: (transform: ZoomTransform) => void) => () => void;

export const useZoomedBackground = (
  subscribe: Subscribe,
  ref: RefObject<SVGSVGElement | null>,
  config: ZoomedBackgroundConfig,
) => {
  useEffect(() => {
    const element = ref.current;
    if (!element || !config.imageUrl) return;
    element.style.backgroundImage = `url(${config.imageUrl})`;
    element.style.backgroundRepeat = "no-repeat";
  }, [ref, config.imageUrl]);

  useEffect(() => {
    if (!config.imageUrl) return;
    return subscribe((transform) => {
      const element = ref.current;
      if (!element) return;
      Object.assign(
        element.style,
        backgroundStyle(transform, config.scaleFactor, config.offset),
      );
    });
  }, [
    subscribe,
    ref,
    config.imageUrl,
    config.scaleFactor,
    config.offset.x,
    config.offset.y,
  ]);
};
