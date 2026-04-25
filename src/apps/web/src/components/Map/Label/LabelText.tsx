import type { ReactNode } from "react";
import styled, { css } from "styled-components";

type Label = {
  id: string;
  x: number;
  y: number;
  fontSize: number;
  opacity: number;
  level: 1 | 2 | 3 | 4;
  variant: "area" | "cluster";
  children: ReactNode;
  alignmentBaseline?: "middle" | "hanging" | "text-before-edge";
  forcedHover?: boolean;
};

type Props = Label & {
  onClick?: (label: Label) => void;
};

export const LabelText = <T extends Props>(props: T) => {
  return (
    <Text
      display={props.opacity ? "block" : "none"}
      textAnchor="middle"
      dominantBaseline={props.alignmentBaseline ?? "middle"}
      x={props.x}
      y={props.y}
      $fontSize={props.fontSize}
      $opacity={props.opacity}
      $level={props.level}
      $variant={props.variant}
      $forcedHover={!!props.forcedHover}
      onClick={() => {
        props.onClick?.(props);
      }}
    >
      {props.children}
    </Text>
  );
};

export default LabelText;

const labelFillColor = ($level: 1 | 2 | 3 | 4) => {
  switch ($level) {
    case 1:
      return "rgb(153, 91, 153)";
    case 2:
      return "rgb(57, 57, 57)";
    case 3:
      return "rgb(101, 91, 153)";
    default:
      return "inherit";
  }
};

const areaTreatment = css`
  font-weight: bold;
  text-shadow:
    0 0 1px #f2efe9,
    0 0 2px #f2efe9,
    0 0 5px #f2efe9,
    0 0 5px #f2efe9,
    0 0 5px #f2efe9,
    0 0 5px #f2efe9,
    0 0 5px #f2efe9,
    0 0 5px #f2efe9,
    0 0 5px #f2efe9,
    0 0 5px #f2efe9;
`;

const clusterTreatment = css`
  font-weight: 500;
  text-shadow:
    0 0 1px #f2efe9,
    0 0 2px #f2efe9,
    0 0 5px #f2efe9,
    0 0 5px #f2efe9;
  transition: font-size 30ms ease-out;
`;

const Text = styled.text.attrs<{
  $fontSize: number;
  $opacity: number;
  $forcedHover: boolean;
}>((props) => ({
  style: {
    fontSize: `${props.$fontSize.toString()}px`,
    opacity: props.$opacity,
  },
}))<{
  $level: 1 | 2 | 3 | 4;
  $variant: "area" | "cluster";
}>`
  cursor: pointer;
  ${(props) => (props.$variant === "area" ? areaTreatment : clusterTreatment)}
  fill: ${(props) => {
    return props.$forcedHover ? "#4a90e2" : labelFillColor(props.$level);
  }};

  &:hover {
    fill: #4a90e2;
  }
`;
