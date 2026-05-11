import { z } from "zod";
import {
  type ClusterMatch,
  DEFAULT_SORT,
  sortValueSchema,
} from "@map-of-science/atlas";
import { present } from "../cluster/cluster.js";
import type { Lang } from "../context.js";
import { publicProcedure, router } from "../trpc.js";

const presentMatch = (match: ClusterMatch, lang: Lang) => ({
  ...present(match, lang),
  score: match.score,
});

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
    .query(async ({ input, ctx }) => {
      const matches = await ctx.search.query({
        text: input.text,
        ...(input.limit !== undefined ? { limit: input.limit } : {}),
        ...(input.minScore !== undefined ? { minScore: input.minScore } : {}),
        sort: input.sort,
      });
      return matches.map((match) => presentMatch(match, ctx.lang));
    }),
});
