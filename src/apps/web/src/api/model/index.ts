import { z as zod } from "zod";

export const ConceptSchema = (z: typeof zod) =>
  z.object({
    index: z.coerce.number(),
    key: z.string(),
  });
export type Concept = zod.infer<ReturnType<typeof ConceptSchema>>;

export const CityLabelSchema = (z: typeof zod) =>
  z
    .object({
      cluster_id: z.coerce.number(),
      label: z.string(),
    })
    .transform((data) => ({
      clusterId: data.cluster_id,
      label: data.label,
    }));
export type CityLabel = zod.infer<ReturnType<typeof CityLabelSchema>>;

export const DataSchema = (z: typeof zod, labels: Map<number, CityLabel>) =>
  z
    .object({
      cluster_id: z.coerce.number(),
      x: z.coerce.number(),
      y: z.coerce.number(),
      num_recent_articles: z.coerce.number(),
      cluster_category: z.coerce.number(),
      growth_rating: z.coerce.number(),
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
      cityLabel: labels.get(data.cluster_id)?.label ?? null,
    }));
export type DataPoint = zod.infer<ReturnType<typeof DataSchema>>;

export const YoutubeVideoSchema = (z: typeof zod) =>
  z
    .object({
      video_id: z.string(),
      video_title: z.string(),
      date: z.string().datetime(),
      segment_number: z.string(),
      segment_timestamp: z.string(),
      segment_url: z.string().url(),
      segment_topic: z.string(),
      reference: z.string(),
      article_link: z.string().url(),
      segment_name: z.string(),
      classification: z.string(),
    })
    .transform((data) => ({
      videoId: data.video_id,
      videoTitle: data.video_title,
      date: data.date,
      segmentNumber: parseInt(data.segment_number.replace(")", "").trim(), 10),
      segmentTimestamp: data.segment_timestamp,
      segmentUrl: data.segment_url,
      segmentTopic: data.segment_topic,
      reference: data.reference,
      articleLink: data.article_link,
      segmentName: data.segment_name,
      labelId: data.classification,
    }));
export type YoutubeVideo = zod.infer<ReturnType<typeof YoutubeVideoSchema>>;
