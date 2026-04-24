import { LINE_HEIGHT } from "../../../map/labels/config.ts";
import type { PlacedLabel } from "../../../map/labels/useLabelPlacement.ts";
import LabelText from "../Label/LabelText.tsx";

type Props = {
  labels: PlacedLabel[];
  fontSize: number;
  offset: number;
};

// SVG dy expressed in em units so the line gap scales with the <text>
// font-size. First line sits at the anchor; each next line drops by LINE_HEIGHT.
const lineOffsetEm = (index: number) =>
  index === 0 ? 0 : `${LINE_HEIGHT.toString()}em`;

export const ClusterLabels = ({ labels, fontSize, offset }: Props) => {
  return (
    <>
      {labels.map(({ id, position, layout }) => (
        <LabelText
          key={id}
          id={id}
          x={position.x}
          y={position.y - offset}
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
      ))}
    </>
  );
};
