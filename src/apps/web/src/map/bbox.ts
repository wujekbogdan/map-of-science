import type { ZoomTransform } from "d3";

export const transformToBbox = (
  transform: ZoomTransform,
  size: { width: number; height: number },
) => ({
  x: { min: transform.invertX(0), max: transform.invertX(size.width) },
  y: { min: transform.invertY(0), max: transform.invertY(size.height) },
});

export type BBox = ReturnType<typeof transformToBbox>;
