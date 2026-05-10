import { z } from "zod";

export const MIN_SCORE_DEFAULT = 0.65;

export const searchParamsSchema = z.object({
  q: z.string().optional(),
  // Stored optional so the URL can omit it when at default; readers fall back
  // to MIN_SCORE_DEFAULT at the call site.
  minScore: z
    .number()
    .transform((value) => Math.max(0, Math.min(1, value)))
    .optional()
    .catch(undefined),
});
