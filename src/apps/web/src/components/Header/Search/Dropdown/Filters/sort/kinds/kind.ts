import type { FC } from "react";
import type { SortValue } from "../sortValue.ts";

export type SortKind = {
  id: SortValue["kind"];
  default: SortValue;
  Component?: FC<{ value: SortValue; onChange: (next: SortValue) => void }>;
};
