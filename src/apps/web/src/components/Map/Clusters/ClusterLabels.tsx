import type { CSSProperties } from "react";
import styled from "styled-components";
import { LABEL_DOT_GAP_PX, LINE_HEIGHT } from "../../../map/labels/config.ts";
import type { PlacedLabel } from "../../../map/labels/useLabelPlacement.ts";
import LabelText from "../Label/LabelText.tsx";
import css from "./clusters.module.scss";

type Props = {
  labels: PlacedLabel[];
  zoomScale: number;
  hoveredId?: string | null;
  onHoveredClusterChange?: (id: string | null) => void;
  onClusterClick?: (id: string) => void;
  onHoveredElChange?: (el: SVGGElement | null) => void;
};

const lineOffsetEm = (index: number) =>
  index === 0 ? 0 : `${LINE_HEIGHT.toString()}em`;

export const ClusterLabels = ({
  labels,
  zoomScale,
  hoveredId,
  onHoveredClusterChange,
  onClusterClick,
  onHoveredElChange,
}: Props) => {
  const gapWorld = LABEL_DOT_GAP_PX / zoomScale;
  const strokeWorld = 1 / zoomScale;

  return (
    <>
      {labels.map(({ id, position, layout, labelOffsetPx, fontSize }) => (
        <g
          key={id}
          className={css.label}
          data-test-cluster-id={id}
          ref={id === hoveredId ? onHoveredElChange : undefined}
          style={
            {
              "--label-offset-px": `${labelOffsetPx.toString()}px`,
            } as CSSProperties
          }
          onPointerEnter={() => {
            onHoveredClusterChange?.(id);
          }}
          onPointerLeave={() => {
            onHoveredClusterChange?.(null);
          }}
          onClick={() => {
            onClusterClick?.(id);
          }}
        >
          <Connector
            x1={position.x}
            x2={position.x}
            y1={position.y - gapWorld}
            y2={position.y}
            strokeWidth={strokeWorld}
            $hovered={hoveredId === id}
          />
          <LabelText
            id={id}
            x={position.x}
            y={position.y}
            alignmentBaseline="text-before-edge"
            fontSize={fontSize}
            opacity={1}
            level={4}
            variant="cluster"
            forcedHover={id === hoveredId}
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

const Connector = styled.line<{ $hovered: boolean }>`
  stroke: ${(props) => (props.$hovered ? "#fff" : "#333")};
`;
