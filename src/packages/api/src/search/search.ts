import { z } from "zod";
import { DEFAULT_SORT, sortValueSchema } from "@map-of-science/atlas";
import {
  type ClusterAttributesDto,
  presentAttributes,
} from "../cluster/cluster.js";
import { publicProcedure, router } from "../trpc.js";

export const searchRouter = router({
  query: publicProcedure
    .input(
      z.object({
        text: z.string(),
        limit: z.number().int().optional(),
        minScore: z.number().optional(),
        sort: sortValueSchema.default(DEFAULT_SORT),
      }),
    )
    .query(async ({ input, ctx }): Promise<ClusterAttributesDto[]> => {
      const matches = await ctx.search.query({
        text: input.text,
        ...(input.limit !== undefined ? { limit: input.limit } : {}),
        ...(input.minScore !== undefined ? { minScore: input.minScore } : {}),
        sort: input.sort,
      });
      return matches.map((match) => presentAttributes(match, ctx.lang));
    }),
});
