import { z } from "zod";
import {
  bboxSchema,
  type Cluster,
  rankRelatedClusters,
} from "@map-of-science/atlas";
import type { Context, Lang } from "../context.js";
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

/*
 * Ranks a cluster's citation links, the strongest first, and gives each one a name.
 *
 * `id` is null when the cluster is not stored.
 */
const presentRelatedClusters = async (
  cluster: Cluster,
  { atlas, lang }: Pick<Context, "atlas" | "lang">,
) => {
  const ranked = rankRelatedClusters(cluster.relatedClusters);
  if (ranked.length === 0) return [];

  const found = await atlas.clusters.findByExternalIds(
    ranked.map(({ externalId }) => externalId),
  );
  const byExternalId = new Map(
    found.map((related) => [related.externalId, related]),
  );

  return ranked.map(({ externalId, significantCitations }) => {
    const related = byExternalId.get(externalId);
    return {
      externalId,
      significantCitations,
      id: related?.id ?? null,
      displayName: resolveDisplayName(
        related?.name?.[lang] ?? null,
        externalId,
        lang,
      ),
    };
  });
};

const DEFAULT_VIEWPORT_LIMIT = 500;

export const clusterRouter = router({
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const cluster = await ctx.atlas.clusters.findById(input.id);
      if (!cluster) return null;
      return {
        // The ranked links are a second field, so that `relatedClusters` holds the same shape in every procedure.
        ...present(cluster, ctx.lang),
        rankedRelatedClusters: await presentRelatedClusters(cluster, ctx),
      };
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
