import { z } from "zod";
import { minScoreRouteSchema } from "./Dropdown/Filters/minScore/filter.ts";
import { sortRouteSchema } from "./Dropdown/Filters/sort/filter.ts";

export const searchParamsSchema = z.object({
  q: z.string().optional(),
  ...minScoreRouteSchema,
  ...sortRouteSchema,
});
