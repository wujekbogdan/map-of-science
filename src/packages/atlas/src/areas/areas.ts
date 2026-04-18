import { z } from "zod";
import type { BBox } from "../clusters/clusters.js";

export const areaSchema = z
  .object({
    id: z.string().describe("Unique area identifier."),
    // TODO: remove. This field duplicates `id` (both hold the same UUID from
    // areas.tsv) and has no caller. Kept only for symmetry with Cluster where
    // id and externalId actually differ.
    externalId: z.string().describe("ID from areas.tsv."),
    position: z.object({
      x: z.number().describe("Horizontal coordinate, increases rightward."),
      y: z.number().describe("Vertical coordinate, increases downward."),
    }),
    tier: z
      .number()
      .int()
      .describe("Level in the area hierarchy. 1 = broadest, higher = finer."),
    name: z
      .object({
        en_US: z.string(),
        pl_PL: z.string(),
      })
      .describe("Area label per language."),
  })
  .describe(
    "A named label, for example 'Europe' or 'Physics'. Positioned based on the surrounding clusters.",
  );

export type Area = z.infer<typeof areaSchema>;

/* Storage interface for areas. */
export type AreaRepository = {
  /* Set up area storage. Run once. */
  createSchema(): Promise<void>;
  /* Add or update areas. */
  upsert(items: Area[]): Promise<void>;
  /* Get one area by id. Null if not found. */
  findById(id: string): Promise<Area | null>;
  /* Get areas whose position falls inside the bounding box, optionally narrowed to one tier. */
  findInViewport(args: { bbox: BBox; tier?: number }): Promise<Area[]>;
};
