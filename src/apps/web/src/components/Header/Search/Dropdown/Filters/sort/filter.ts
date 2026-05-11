import { z } from "zod";
import { defineFilter } from "../defineFilter.tsx";
import { SortFilter } from "./SortFilter.tsx";
import { decodeSort, encodeSort } from "./encoding.ts";
import type { SortSelection } from "./sortSelection.ts";

const DEFAULT_SORT: SortSelection = { kind: "relevance" };

const isDefault = (value: SortSelection) => value.kind === DEFAULT_SORT.kind;

export const sortRouteSchema = {
  sort: z.string().optional().catch(undefined),
};

export const parseSort = (params: Record<string, unknown>): SortSelection =>
  decodeSort(params.sort) ?? DEFAULT_SORT;

export const serializeSort = (value: SortSelection) => ({
  sort: isDefault(value) ? undefined : encodeSort(value),
});

export const sortFilter = defineFilter<SortSelection>({
  id: "sort",
  routeSchema: sortRouteSchema,
  parse: parseSort,
  serialize: serializeSort,
  Component: SortFilter,
});
