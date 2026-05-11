import { articlesCountKind } from "./articlesCount/articlesCountKind.ts";
import type { SortKind } from "./kind.ts";
import { relevanceKind } from "./relevance/relevanceKind.ts";

export const sortKinds: readonly SortKind[] = [
  relevanceKind,
  articlesCountKind,
];
