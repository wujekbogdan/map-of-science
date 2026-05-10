import type { SortValue } from "../../sortValue.ts";

type Props = { value: SortValue; onChange: (next: SortValue) => void };

export const DirectionToggle = ({ value, onChange }: Props) => {
  if (value.kind !== "articlesCount") return null;

  const onClick = () => {
    onChange({
      kind: "articlesCount",
      direction: value.direction === "asc" ? "desc" : "asc",
    });
  };

  return (
    <button type="button" onClick={onClick}>
      {value.direction === "desc" ? "↓" : "↑"}
    </button>
  );
};
