import type { FC } from "react";
import type { SortSelection } from "../sortSelection.ts";

export type SortKind = {
  id: SortSelection["kind"];
  default: SortSelection;
  Component?: FC<{
    value: SortSelection;
    onChange: (next: SortSelection) => void;
  }>;
};
