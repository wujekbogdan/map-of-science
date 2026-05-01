import { z } from "zod";
import { bboxSchema, type Cluster } from "@map-of-science/atlas";
import type { Lang } from "../context.js";
import { publicProcedure, router } from "../trpc.js";

const PLACEHOLDER_PREFIX: Record<Lang, string> = {
  en_US: "Cluster",
  pl_PL: "Klaster",
};

const resolveDisplayName = (
  name: string | null,
  externalId: number,
  lang: Lang,
) => {
  if (name) return name;
  return `${PLACEHOLDER_PREFIX[lang]} #${externalId.toString()}`;
};

/*
 * Maps a domain Cluster into its API DTO. Resolves name to the requested
 * language, outputs y in screen-space (y-down), and computes a localized
 * "Cluster #N" / "Klaster #N" placeholder when the cluster has no name.
 *
 * Every Cluster leaving the API goes through this.
 */
export const present = (cluster: Cluster, lang: Lang) => {
  const name = cluster.name?.[lang] ?? null;
  return {
    ...cluster,
    position: { x: cluster.position.x, y: -cluster.position.y },
    name,
    displayName: resolveDisplayName(name, cluster.externalId, lang),
  };
};

const DEFAULT_VIEWPORT_LIMIT = 500;

export const clusterRouter = router({
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const cluster = await ctx.atlas.clusters.findById(input.id);
      return cluster ? present(cluster, ctx.lang) : null;
    }),

  byIds: publicProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .query(async ({ input, ctx }) => {
      const clusters = await ctx.atlas.clusters.findByIds(input.ids);
      return clusters.map((cluster) => present(cluster, ctx.lang));
    }),

  viewport: publicProcedure
    .input(z.object({ bbox: bboxSchema, limit: z.number().int().optional() }))
    .query(async ({ input, ctx }) => {
      const { bbox } = input;
      const clusters = await ctx.atlas.clusters.findInViewport({
        bbox: {
          x: bbox.x,
          y: { min: -bbox.y.max, max: -bbox.y.min },
        },
        limit: input.limit ?? DEFAULT_VIEWPORT_LIMIT,
      });
      return clusters.map((cluster) => present(cluster, ctx.lang));
    }),
});
