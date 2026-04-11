import { z } from "zod";
import type { BBox } from "../clusters/clusters.js";

export const areaSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  tier: z.number().int(),
  name: z.object({
    en_US: z.string(),
    pl_PL: z.string(),
  }),
});

export type Area = z.infer<typeof areaSchema>;

export type AreaRepository = {
  ensureSchema(): Promise<void>;
  upsert(items: Area[]): Promise<void>;
  findById(id: string): Promise<Area | null>;
  findInViewport(args: { bbox: BBox; tier?: number }): Promise<Area[]>;
};
