import LabelText from "./LabelText.tsx";

type Label = {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  opacity: number;
  level: 1 | 2 | 3 | 4;
  onClick?: OnLabelClick;
};

export type OnLabelClick = (
  label: Pick<Label, "id" | "text" | "x" | "y">,
) => void;

const Label = (props: Label) => {
  const onClick = props.onClick
    ? () => {
        props.onClick?.({
          id: props.id,
          text: props.text,
          x: props.x,
          y: props.y,
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
      variant="area"
      onClick={onClick}
    >
      {props.text}
    </LabelText>
  );
};

export default Label;
