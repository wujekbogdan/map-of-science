import styled from "styled-components";
import { YoutubeVideo } from "../../api/model";

type Label = {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  opacity: number;
  level: 1 | 2 | 3 | 4;
  videos: YoutubeVideo[];
  onClick?: OnLabelClick;
};

export type OnLabelClick = (
  label: Pick<Label, "text" | "x" | "y" | "videos">,
) => void;

const Label = (props: Label) => {
  const onClick = props.onClick
    ? () => {
        props.onClick?.({
          text: props.text,
          x: props.x,
          y: props.y,
          videos: props.videos,
        });
      }
    : undefined;

  return (
    <LabelText
      display={props.opacity ? "block" : "none"}
      textAnchor="middle"
      alignmentBaseline="middle"
      x={props.x}
      y={props.y}
      $fontSize={props.fontSize}
      $opacity={props.opacity}
      $level={props.level}
      onClick={onClick}
    >
      {props.text}
    </LabelText>
  );
};

export default Label;

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

const LabelText = styled.text.attrs<{
  $fontSize: number;
  $opacity: number;
}>((props) => ({
  style: {
    fontSize: `${props.$fontSize.toString()}px`,
    opacity: props.$opacity,
  },
}))<{
  $level: 1 | 2 | 3 | 4;
}>`
  cursor: pointer;
  font-weight: bold;
  // TODO: It can be, very likely, replaced with a simplified text-shadow
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
  fill: ${(props) => labelFillColor(props.$level)};

  &:hover {
    fill: #4a90e2;
  }
`;
