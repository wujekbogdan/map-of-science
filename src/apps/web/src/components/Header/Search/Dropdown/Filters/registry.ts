import type { Filter } from "./defineFilter.tsx";
import { minScoreFilter } from "./minScore/filter.ts";
import { sortFilter } from "./sort/filter.ts";

export const filters: readonly Filter[] = [minScoreFilter, sortFilter];
