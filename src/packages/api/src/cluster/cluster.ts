import { z } from "zod";
import { bboxSchema, type Cluster } from "@map-of-science/atlas";
import type { Lang } from "../context.js";
import { publicProcedure, router } from "../trpc.js";

const resolveDisplayName = (
  name: string | null,
  keyConcepts: string[],
  externalId: number,
) => {
  if (name) return name;
  if (keyConcepts.length > 0) return keyConcepts.join(", ");
  return `Cluster ${externalId.toString()}`;
};

export const localizeCluster = (cluster: Cluster, lang: Lang) => {
  const name = cluster.name?.[lang] ?? null;
  return {
    ...cluster,
    name,
    displayName: resolveDisplayName(
      name,
      cluster.keyConcepts,
      cluster.externalId,
    ),
  };
};

const DEFAULT_VIEWPORT_LIMIT = 500;

export const clusterRouter = router({
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const cluster = await ctx.atlas.clusters.findById(input.id);
      return cluster ? localizeCluster(cluster, ctx.lang) : null;
    }),

  byIds: publicProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .query(async ({ input, ctx }) => {
      const clusters = await ctx.atlas.clusters.findByIds(input.ids);
      return clusters.map((cluster) => localizeCluster(cluster, ctx.lang));
    }),

  viewport: publicProcedure
    .input(z.object({ bbox: bboxSchema, limit: z.number().int().optional() }))
    .query(async ({ input, ctx }) => {
      const clusters = await ctx.atlas.clusters.findInViewport({
        bbox: input.bbox,
        limit: input.limit ?? DEFAULT_VIEWPORT_LIMIT,
      });
      return clusters.map((cluster) => localizeCluster(cluster, ctx.lang));
    }),
});
