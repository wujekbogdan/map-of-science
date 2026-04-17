import { z } from "zod";
import type { BBox } from "../clusters/clusters.js";

export const areaSchema = z.object({
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
});

export type Area = z.infer<typeof areaSchema>;

export type AreaRepository = {
  createSchema(): Promise<void>;
  upsert(items: Area[]): Promise<void>;
  findById(id: string): Promise<Area | null>;
  findInViewport(args: { bbox: BBox; tier?: number }): Promise<Area[]>;
};
