import type { LabelLayout } from "./computeLabelLayout.ts";
import { REF_FONT_SIZE } from "./config.ts";

export const labelBbox = ({
  anchor,
  layout,
  fontSizePx,
  offsetPx,
}: {
  anchor: { x: number; y: number };
  layout: LabelLayout;
  fontSizePx: number;
  offsetPx: number;
}) => {
  const scale = fontSizePx / REF_FONT_SIZE;
  const halfWidth = (layout.widthAtRefFont * scale) / 2;
  const height = layout.heightAtRefFont * scale;
  const top = anchor.y + offsetPx;

  return {
    minX: anchor.x - halfWidth,
    minY: top,
    maxX: anchor.x + halfWidth,
    maxY: top + height,
  };
};

export type Bbox = ReturnType<typeof labelBbox>;
