import { z } from "zod";

/**
 * Atlas entity position. Unitless map coordinates derived from ETO data.
 * Typical ranges: x ~ [-622, 565], y ~ [-500, 500].
 *
 * Storage convention (per entity - not yet unified):
 * - Cluster: natural / y-up (mathematical convention)
 * - Area: screen-space / y-down
 *
 * The API layer flips cluster y to screen-space so consumers always see
 * y-down. Areas pass through unchanged.
 *
 * TODO: unify storage on natural (y-up) across all atlas entities and move
 * area y-flip into the API layer too.
 */
export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});
