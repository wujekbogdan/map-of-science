import type { SortKind } from "../kind.ts";
import { DirectionToggle } from "./DirectionToggle.tsx";

export const articlesCountKind: SortKind = {
  id: "articlesCount",
  label: "Articles count",
  default: { kind: "articlesCount", direction: "desc" },
  Component: DirectionToggle,
};
