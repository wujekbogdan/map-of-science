import { z } from "zod";
import { defineFilter } from "../defineFilter.tsx";
import { SortFilter } from "./SortFilter.tsx";
import { decodeSort, encodeSort } from "./encoding.ts";
import type { SortValue } from "./sortValue.ts";

const DEFAULT_SORT: SortValue = { kind: "relevance" };

const isDefault = (value: SortValue) => value.kind === DEFAULT_SORT.kind;

export const sortRouteSchema = {
  sort: z.string().optional().catch(undefined),
};

export const parseSort = (params: Record<string, unknown>): SortValue =>
  decodeSort(params.sort) ?? DEFAULT_SORT;

export const serializeSort = (value: SortValue) => ({
  sort: isDefault(value) ? undefined : encodeSort(value),
});

export const sortFilter = defineFilter<SortValue>({
  id: "sort",
  routeSchema: sortRouteSchema,
  parse: parseSort,
  serialize: serializeSort,
  Component: SortFilter,
});
