import { z } from "zod";

export const MIN_SCORE_DEFAULT = 0.65;

export const searchParamsSchema = z.object({
  q: z.string().optional(),
  minScore: z
    .number()
    .transform((value) => Math.max(0, Math.min(1, value)))
    .default(MIN_SCORE_DEFAULT)
    .catch(MIN_SCORE_DEFAULT),
});
