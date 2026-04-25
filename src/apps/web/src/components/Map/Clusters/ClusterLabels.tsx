import type { CSSProperties } from "react";
import { LINE_HEIGHT } from "../../../map/labels/config.ts";
import type { PlacedLabel } from "../../../map/labels/useLabelPlacement.ts";
import LabelText from "../Label/LabelText.tsx";
import css from "./clusters.module.scss";

type Props = {
  labels: PlacedLabel[];
  fontSize: number;
};

const lineOffsetEm = (index: number) =>
  index === 0 ? 0 : `${LINE_HEIGHT.toString()}em`;

export const ClusterLabels = ({ labels, fontSize }: Props) => {
  return (
    <>
      {labels.map(({ id, position, layout, labelOffsetPx }) => (
        <g
          key={id}
          className={css.label}
          style={
            {
              "--label-offset-px": `${labelOffsetPx.toString()}px`,
            } as CSSProperties
          }
        >
          <LabelText
            id={id}
            x={position.x}
            y={position.y}
            alignmentBaseline="text-before-edge"
            fontSize={fontSize}
            opacity={1}
            level={4}
          >
            {layout.lines.map((line, index) => (
              <tspan key={line} x={position.x} dy={lineOffsetEm(index)}>
                {line}
              </tspan>
            ))}
          </LabelText>
        </g>
      ))}
    </>
  );
};
