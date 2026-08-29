import { z } from "zod";
import {
  bboxSchema,
  type Cluster,
  type ClusterMapAttributes,
  rankRelatedClusters,
} from "@map-of-science/atlas";
import type { Context, Lang } from "../context.js";
import { publicProcedure, router } from "../trpc.js";

/* cluster.viewport and search.query both answer with this. */
export type ClusterAttributesDto = {
  id: string;
  externalId: number;
  position: { x: number; y: number };
  displayName: string;
  articlesCount: number;
  growthRating: number;
  keyConcepts: string[];
};

/* One citation link. `id` is null when the cluster is not stored. */
export type RelatedClusterDto = {
  id: string | null;
  externalId: number;
  displayName: string;
};

/* cluster.byId answers with this. */
export type ClusterDto = ClusterAttributesDto & {
  name: string | null;
  averageArticleAgeYears: number;
  citationRating: number;
  patentRating: number;
  topJournals: string[];
  topInstitutions: string[];
  topCompanies: string[];
  articles: Cluster["articles"];
  rankedRelatedClusters: RelatedClusterDto[];
};

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

/* The y axis points down on the wire, and up in the domain. */
const toScreenPosition = (position: Cluster["position"]) => ({
  x: position.x,
  y: -position.y,
});

export const presentAttributes = (
  cluster: ClusterMapAttributes,
  lang: Lang,
) => {
  const name = cluster.name?.[lang] ?? null;
  return {
    id: cluster.id,
    externalId: cluster.externalId,
    position: toScreenPosition(cluster.position),
    displayName: resolveDisplayName(name, cluster.externalId, lang),
    articlesCount: cluster.articlesCount,
    growthRating: cluster.growthRating,
    keyConcepts: cluster.keyConcepts,
  } satisfies ClusterAttributesDto;
};

const presentCluster = ({
  cluster,
  rankedRelatedClusters,
  lang,
}: {
  cluster: Cluster;
  rankedRelatedClusters: RelatedClusterDto[];
  lang: Lang;
}): ClusterDto => ({
  ...presentAttributes(cluster, lang),
  name: cluster.name?.[lang] ?? null,
  averageArticleAgeYears: cluster.averageArticleAgeYears,
  citationRating: cluster.citationRating,
  patentRating: cluster.patentRating,
  topJournals: cluster.topJournals,
  topInstitutions: cluster.topInstitutions,
  topCompanies: cluster.topCompanies,
  articles: cluster.articles,
  rankedRelatedClusters,
});

/* Ranks a cluster's citation links, the strongest first, and gives each one a name. */
const presentRelatedClusters = async (
  cluster: Cluster,
  { atlas, lang }: Pick<Context, "atlas" | "lang">,
) => {
  const ranked = rankRelatedClusters(cluster.relatedClusters);
  if (ranked.length === 0) return [];

  const found = await atlas.clusterAttributes.findByExternalIds(
    ranked.map(({ externalId }) => externalId),
  );
  const byExternalId = new Map(
    found.map((related) => [related.externalId, related]),
  );

  return ranked.map(({ externalId }) => {
    const related = byExternalId.get(externalId);
    return {
      id: related?.id ?? null,
      externalId,
      displayName: resolveDisplayName(
        related?.name?.[lang] ?? null,
        externalId,
        lang,
      ),
    } satisfies RelatedClusterDto;
  });
};

const DEFAULT_VIEWPORT_LIMIT = 500;

export const clusterRouter = router({
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }): Promise<ClusterDto | null> => {
      const cluster = await ctx.atlas.clusters.findById(input.id);
      if (!cluster) return null;
      return presentCluster({
        cluster,
        rankedRelatedClusters: await presentRelatedClusters(cluster, ctx),
        lang: ctx.lang,
      });
    }),

  viewport: publicProcedure
    .input(z.object({ bbox: bboxSchema, limit: z.number().int().optional() }))
    .query(async ({ input, ctx }): Promise<ClusterAttributesDto[]> => {
      const { bbox } = input;
      const clusters = await ctx.atlas.clusterAttributes.findInViewport({
        bbox: {
          x: bbox.x,
          y: { min: -bbox.y.max, max: -bbox.y.min },
        },
        limit: input.limit ?? DEFAULT_VIEWPORT_LIMIT,
      });
      return clusters.map((cluster) => presentAttributes(cluster, ctx.lang));
    }),
});
