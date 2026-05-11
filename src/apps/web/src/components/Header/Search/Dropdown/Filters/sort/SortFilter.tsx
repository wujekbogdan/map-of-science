import { ChangeEventHandler } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { sortKinds } from "./kinds/registry.ts";
import type { SortSelection } from "./sortSelection.ts";

type Props = {
  value: SortSelection;
  onChange: (next: SortSelection) => void;
};

export const SortFilter = ({ value, onChange }: Props) => {
  const { t } = useTranslation();

  const onSelectChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const nextKind = sortKinds.find((kind) => kind.id === event.target.value);
    if (!nextKind) return;
    onChange(nextKind.default);
  };

  const activeKind = sortKinds.find((kind) => kind.id === value.kind);
  const Extras = activeKind?.Component;

  return (
    <Field>
      <Label htmlFor="sort-filter">{t("search.filters.sort")}</Label>
      <Select id="sort-filter" value={value.kind} onChange={onSelectChange}>
        {sortKinds.map((kind) => (
          <option key={kind.id} value={kind.id}>
            {t(`search.filters.sort.kind.${kind.id}`)}
          </option>
        ))}
      </Select>
      {Extras ? <Extras value={value} onChange={onChange} /> : null}
    </Field>
  );
};

const Field = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
`;

const Label = styled.label`
  color: #888;
`;

const Select = styled.select`
  padding: 4px 6px;
  border: 1px solid #ededed;
  background-color: white;
  font-family: inherit;
  font-size: inherit;
  color: #555;
`;
