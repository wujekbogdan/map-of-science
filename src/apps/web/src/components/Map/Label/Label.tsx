import { YoutubeVideo } from "../../../api/model";
import LabelText from "./LabelText.tsx";

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
      id={props.id}
      x={props.x}
      y={props.y}
      fontSize={props.fontSize}
      opacity={props.opacity}
      level={props.level}
      onClick={onClick}
    >
      {props.text}
    </LabelText>
  );
};

export default Label;
