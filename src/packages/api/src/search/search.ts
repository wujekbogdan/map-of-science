import { z } from "zod";
import type { ClusterMatch } from "@map-of-science/atlas";
import type { Lang } from "../context.js";
import { publicProcedure, router } from "../trpc.js";

type LocalizedMatch = Omit<ClusterMatch, "name"> & { name: string | null };

const localizeMatch = (match: ClusterMatch, lang: Lang): LocalizedMatch => ({
  ...match,
  name: match.name?.[lang] ?? null,
});

export const searchRouter = router({
  query: publicProcedure
    .input(z.object({ text: z.string(), limit: z.number().int().optional() }))
    .query(async ({ input, ctx }) => {
      const matches = await ctx.search.query({
        text: input.text,
        ...(input.limit !== undefined ? { limit: input.limit } : {}),
      });
      return matches.map((match) => localizeMatch(match, ctx.lang));
    }),
});
