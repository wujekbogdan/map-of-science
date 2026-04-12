import { z } from "zod";
import { type Area, bboxSchema } from "@map-of-science/atlas";
import type { Lang } from "../context.js";
import { publicProcedure, router } from "../trpc.js";

type LocalizedArea = Omit<Area, "name"> & { name: string };

const localizeArea = (area: Area, lang: Lang): LocalizedArea => ({
  ...area,
  name: area.name[lang],
});

export const areaRouter = router({
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const area = await ctx.atlas.areas.findById(input.id);
      return area ? localizeArea(area, ctx.lang) : null;
    }),

  viewport: publicProcedure
    .input(z.object({ bbox: bboxSchema, tier: z.number().int().optional() }))
    .query(async ({ input, ctx }) => {
      const areas = await ctx.atlas.areas.findInViewport({
        bbox: input.bbox,
        ...(input.tier !== undefined ? { tier: input.tier } : {}),
      });
      return areas.map((area) => localizeArea(area, ctx.lang));
    }),
});
