import type { ZoomTransform } from "d3";
import { useMemo } from "react";
import { transformToBbox, type BBox } from "../bbox.ts";

export const useZoomBbox = (
  transform: ZoomTransform | undefined,
  size: { width: number; height: number },
): BBox | null =>
  useMemo(
    () => (transform ? transformToBbox(transform, size) : null),
    [transform, size.width, size.height],
  );
