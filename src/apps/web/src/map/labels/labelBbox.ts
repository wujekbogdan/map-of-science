import type { ZoomTransform } from "d3";
import type { LabelLayout } from "./computeLabelLayout.ts";
import { REF_FONT_SIZE } from "./config.ts";

export const labelBbox = ({
  cluster,
  layout,
  transform,
  fontSize,
  offset,
}: {
  cluster: { position: { x: number; y: number } };
  layout: LabelLayout;
  transform: ZoomTransform;
  fontSize: number;
  offset: number;
}) => {
  const [screenX, screenY] = transform.apply([
    cluster.position.x,
    cluster.position.y,
  ]);
  const anchorY = screenY - offset;

  const scale = fontSize / REF_FONT_SIZE;
  const halfWidth = (layout.widthAtRefFont * scale) / 2;
  const halfHeight = (layout.heightAtRefFont * scale) / 2;

  return {
    minX: screenX - halfWidth,
    minY: anchorY - halfHeight,
    maxX: screenX + halfWidth,
    maxY: anchorY + halfHeight,
  };
};

export type Bbox = ReturnType<typeof labelBbox>;
