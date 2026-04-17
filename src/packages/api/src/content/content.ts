import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";

export const contentRouter = router({
  byCluster: publicProcedure
    .input(z.object({ clusterId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.atlas.content.findByClusterId(input.clusterId);
    }),
  byArea: publicProcedure
    .input(z.object({ areaId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.atlas.content.findByAreaId(input.areaId);
    }),
});
