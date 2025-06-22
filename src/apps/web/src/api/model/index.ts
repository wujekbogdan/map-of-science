import { z as zod } from "zod";

export const ConceptSchema = (z: typeof zod) =>
  z.object({
    index: z.coerce.number(),
    key: z.string(),
  });
export type Concept = zod.infer<ReturnType<typeof ConceptSchema>>;

export const AreaSchema = (z: typeof zod) =>
  z
    .object({
      id: z.string(),
      x: z.coerce.number(),
      y: z.coerce.number(),
      level: z.preprocess(
        (val) => Number(val),
        z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
      ),
      cluster_id: z.union([z.literal("null"), z.string()]),
    })
    .transform(({ cluster_id, ...rest }) => ({
      ...rest,
      clusterId: cluster_id === "null" ? null : parseInt(cluster_id, 10),
    }));
export type Area = zod.infer<ReturnType<typeof AreaSchema>>;

export const AreaI18nSchema = (z: typeof zod) =>
  z.object({
    id: z.string(),
    "pl-PL": z.string(),
    "en-US": z.string(),
  });
export type AreaLabelI18n = zod.infer<ReturnType<typeof AreaI18nSchema>>;

export const i18nSchema = (z: typeof zod) =>
  z.object({
    id: z.string(),
    translation: z.string(),
  });
export type i18n = zod.infer<ReturnType<typeof i18nSchema>>;

export const DataSchema = (z: typeof zod) =>
  z
    .object({
      cluster_id: z.coerce.number(),
      x: z.coerce.number(),
      y: z.coerce.number(),
      num_recent_articles: z.coerce.number(),
      cluster_category: z.coerce.number(),
      growth_rating: z.coerce.number().min(0).max(100),
      key_concepts: z.string(),
    })
    .transform((data) => ({
      clusterId: data.cluster_id,
      x: data.x,
      y: -data.y, // To align it with the map coordinate system
      numRecentArticles: data.num_recent_articles,
      clusterCategory: data.cluster_category,
      growthRating: data.growth_rating,
      keyConcepts: data.key_concepts.split(",").map((id) => Number(id)),
    }));
export type DataPoint = zod.infer<ReturnType<typeof DataSchema>>;

export const YoutubeVideoSchema = (z: typeof zod) =>
  z
    .object({
      video_id: z.string(),
      video_title: z.string(),
      date: z.string().datetime(),
      segment_url: z.string().url(),
      segment_name: z.string(),
      classification: z.string(),
    })
    .transform((data) => ({
      videoId: data.video_id,
      videoTitle: data.video_title,
      date: data.date,
      segmentUrl: data.segment_url,
      segmentName: data.segment_name,
      labelIds: data.classification.split("|"),
    }));
export type YoutubeVideo = zod.infer<ReturnType<typeof YoutubeVideoSchema>>;
