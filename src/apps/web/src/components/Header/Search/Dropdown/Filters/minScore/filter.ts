import { z } from "zod";
import { defineFilter } from "../defineFilter.tsx";
import { MinScoreFilter } from "./MinScoreFilter.tsx";

export const MIN_SCORE_DEFAULT = 0.65;

export const minScoreRouteSchema = {
  minScore: z
    .number()
    .transform((value) => Math.max(0, Math.min(1, value)))
    .optional()
    .catch(undefined),
};

export const parseMinScore = (params: Record<string, unknown>): number => {
  const value = params.minScore;
  return typeof value === "number" ? value : MIN_SCORE_DEFAULT;
};

export const serializeMinScore = (value: number) => ({
  minScore: value === MIN_SCORE_DEFAULT ? undefined : value,
});

export const minScoreFilter = defineFilter<number>({
  id: "minScore",
  routeSchema: minScoreRouteSchema,
  parse: parseMinScore,
  serialize: serializeMinScore,
  Component: MinScoreFilter,
});
