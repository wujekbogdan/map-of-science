import { z as zod } from "zod";

export const ConceptSchema = (z: typeof zod) =>
  z.object({
    index: z.coerce.number(),
    key: z.string(),
  });
export type Concept = zod.infer<ReturnType<typeof ConceptSchema>>;

export const AreaSchema = (z: typeof zod) =>
  z.object({
    id: z.string(),
    x: z.coerce.number(),
    y: z.coerce.number(),
    level: z.preprocess(
      (val) => Number(val),
      z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    ),
  });
export type Area = zod.infer<ReturnType<typeof AreaSchema>>;

export const MapEntity18nSchema = (z: typeof zod) =>
  z.object({
    id: z.string(),
    "pl-PL": z.string(),
    "en-US": z.string(),
  });
export type MapEntityI18n = zod.infer<ReturnType<typeof MapEntity18nSchema>>;

export const ClusterNameI18nSchema = (z: typeof zod) =>
  z.object({
    cluster_id: z.coerce.number(),
    "pl-PL": z.string(),
    "en-US": z.string(),
  });
export type ClusterNameI18n = zod.infer<
  ReturnType<typeof ClusterNameI18nSchema>
>;

export const i18nSchema = (z: typeof zod) =>
  z.object({
    id: z.string(),
    translation: z.string(),
  });
export type i18n = zod.infer<ReturnType<typeof i18nSchema>>;

export const PlaceSchema = (z: typeof zod) =>
  z
    .object({
      id: z.string(),
      cluster_id: z.string(),
    })
    .transform((place) => ({
      id: place.id,
      clusterId: place.cluster_id,
    }));
export type Place = zod.infer<ReturnType<typeof PlaceSchema>>;

export const MakeClustersSchema =
  (
    places: Map<string, Place & { text: string }>,
    clusterNames: Map<number, string>,
  ) =>
  (z: typeof zod) =>
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
        articlesCount: data.num_recent_articles,
        clusterCategory: data.cluster_category,
        growthRating: data.growth_rating,
        keyConcepts: data.key_concepts.split(",").map((id) => Number(id)),
        // human-curated labels
        place: places.get(data.cluster_id.toString()) ?? null,
        // LLM-generated names
        name: clusterNames.get(data.cluster_id) ?? null,
      }));

type ClustersSchema = ReturnType<typeof MakeClustersSchema>;
export type Cluster = zod.infer<ReturnType<ClustersSchema>>;

export const YoutubeVideoSchema = (z: typeof zod) =>
  z
    .object({
      video_id: z.string(),
      video_title: z.string(),
      date: z.iso.datetime(),
      segment_url: z.url(),
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
