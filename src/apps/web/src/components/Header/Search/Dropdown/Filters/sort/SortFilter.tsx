import { ChangeEventHandler } from "react";
import { sortKinds } from "./kinds/registry.ts";
import type { SortValue } from "./sortValue.ts";

type Props = {
  value: SortValue;
  onChange: (next: SortValue) => void;
};

export const SortFilter = ({ value, onChange }: Props) => {
  const onSelectChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const nextKind = sortKinds.find((kind) => kind.id === event.target.value);
    if (!nextKind) return;
    onChange(nextKind.default);
  };

  const activeKind = sortKinds.find((kind) => kind.id === value.kind);
  const Extras = activeKind?.Component;

  return (
    <>
      <select value={value.kind} onChange={onSelectChange}>
        {sortKinds.map((kind) => (
          <option key={kind.id} value={kind.id}>
            {kind.label}
          </option>
        ))}
      </select>
      {Extras ? <Extras value={value} onChange={onChange} /> : null}
    </>
  );
};
