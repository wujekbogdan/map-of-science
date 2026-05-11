import { useTranslation } from "react-i18next";
import styled from "styled-components";
import type { SortSelection } from "../../sortSelection.ts";

type Props = {
  value: SortSelection;
  onChange: (next: SortSelection) => void;
};

export const DirectionToggle = ({ value, onChange }: Props) => {
  const { t } = useTranslation();

  if (value.kind !== "articlesCount") return null;

  const onClick = () => {
    onChange({
      kind: "articlesCount",
      direction: value.direction === "asc" ? "desc" : "asc",
    });
  };

  const arrow = value.direction === "desc" ? "↓" : "↑";
  const label = t(`search.filters.sort.direction.${value.direction}`);

  return (
    <Button type="button" onClick={onClick}>
      {arrow} {label}
    </Button>
  );
};

const Button = styled.button`
  align-self: stretch;
  box-sizing: border-box;
  padding: 0 6px;
  border: 1px solid #ededed;
  background-color: white;
  font-family: inherit;
  font-size: inherit;
  color: #555;
  cursor: pointer;
  line-height: 1;
`;
