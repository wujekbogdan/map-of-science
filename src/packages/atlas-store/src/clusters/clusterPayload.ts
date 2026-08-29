import { v5 as uuidv5 } from "uuid";
import { z } from "zod";
import {
  type ClusterInput,
  clusterAssociationsSchema,
  clusterAttributesSchema,
  clusterSchema,
} from "@map-of-science/atlas";

const POINT_ID_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

export const pointId = (externalId: number) =>
  uuidv5(String(externalId), POINT_ID_NAMESPACE);

const attributesPayloadSchema = z.object({
  externalId: z.number(),
  x: z.number(),
  y: z.number(),
  name: z.object({ en_US: z.string(), pl_PL: z.string() }).nullable(),
  articlesCount: z.number(),
  growthRating: z.number(),
  averageArticleAgeYears: z.number(),
  citationRatingPercentile: z.number(),
  patentRatingPercentile: z.number(),
  keyConcepts: z.array(z.string()).default([]),
});

const storedRelatedSchema = z
  .array(z.object({ id: z.number(), significantCitations: z.number() }))
  .transform((entries) =>
    entries.map(({ id, significantCitations }) => ({
      externalId: id,
      significantCitations,
    })),
  );

const associationsPayloadSchema = z.object({
  topJournals: z.array(z.string()),
  topInstitutions: z.array(z.string()),
  topCompanies: z.array(z.string()),
  articles: clusterAssociationsSchema.shape.articles,
  relatedClusters: z.object({
    topCiting: storedRelatedSchema,
    topCited: storedRelatedSchema,
  }),
  nameSource: z.enum(["curated", "llm"]).nullable(),
  embedding: z.object({ model: z.string(), source: z.string() }),
});

const mapAttributesPayloadSchema = attributesPayloadSchema.pick({
  externalId: true,
  x: true,
  y: true,
  name: true,
  articlesCount: true,
  growthRating: true,
  keyConcepts: true,
});

const linkAttributesPayloadSchema = attributesPayloadSchema.pick({
  externalId: true,
  name: true,
});

export const MAP_PAYLOAD_KEYS = Object.keys(mapAttributesPayloadSchema.shape);
export const LINK_PAYLOAD_KEYS = Object.keys(linkAttributesPayloadSchema.shape);

type AttributesPayload = z.input<typeof attributesPayloadSchema>;
type AssociationsPayload = z.input<typeof associationsPayloadSchema>;

const rawPointSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  payload: z.record(z.string(), z.unknown()),
});

const rawScoredPointSchema = rawPointSchema.extend({ score: z.number() });

const toRelatedPayload = (
  related: ClusterInput["relatedClusters"]["topCiting"],
) =>
  related.map((entry) => ({
    id: entry.externalId,
    significantCitations: entry.significantCitations,
  }));

export const toAttributesPayload = (cluster: ClusterInput) => {
  const { position, citationRating, patentRating, ...attributes } =
    clusterAttributesSchema.parse(cluster);
  return {
    ...attributes,
    x: position.x,
    y: position.y,
    citationRatingPercentile: citationRating,
    patentRatingPercentile: patentRating,
  } satisfies AttributesPayload;
};

export const toAssociationsPayload = (cluster: ClusterInput) => {
  const { relatedClusters, ...associations } =
    clusterAssociationsSchema.parse(cluster);
  return {
    ...associations,
    relatedClusters: {
      topCiting: toRelatedPayload(relatedClusters.topCiting),
      topCited: toRelatedPayload(relatedClusters.topCited),
    },
  } satisfies AssociationsPayload;
};

/* `toAttributesPayload` validated these values on the way in. */
export const toMapAttributes = (rawPoint: unknown) => {
  const { id, payload } = rawPointSchema.parse(rawPoint);
  const stored = mapAttributesPayloadSchema.parse(payload);
  return {
    id,
    externalId: stored.externalId,
    position: { x: stored.x, y: stored.y },
    name: stored.name,
    articlesCount: stored.articlesCount,
    growthRating: stored.growthRating,
    keyConcepts: stored.keyConcepts,
  };
};

export const toMatch = (rawPoint: unknown) => {
  const { score } = rawScoredPointSchema.parse(rawPoint);
  return { ...toMapAttributes(rawPoint), score };
};

export const toLinkAttributes = (rawPoint: unknown) => {
  const { id, payload } = rawPointSchema.parse(rawPoint);
  const { externalId, name } = linkAttributesPayloadSchema.parse(payload);
  return { id, externalId, name };
};

export const toCluster = ({
  id,
  attributes,
  associations,
}: {
  id: string;
  attributes: Record<string, unknown>;
  associations: Record<string, unknown>;
}) => {
  const stored = attributesPayloadSchema.parse(attributes);
  return clusterSchema.parse({
    id,
    externalId: stored.externalId,
    position: { x: stored.x, y: stored.y },
    name: stored.name,
    articlesCount: stored.articlesCount,
    growthRating: stored.growthRating,
    averageArticleAgeYears: stored.averageArticleAgeYears,
    citationRating: stored.citationRatingPercentile,
    patentRating: stored.patentRatingPercentile,
    keyConcepts: stored.keyConcepts,
    ...associationsPayloadSchema.parse(associations),
  });
};
