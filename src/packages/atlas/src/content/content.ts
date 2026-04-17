import { z } from "zod";

export const entityRefSchema = z.object({
  type: z.enum(["cluster", "area"]),
  id: z.string(),
});

export const youtubeSegmentContentSchema = z.object({
  id: z.string(),
  type: z.literal("youtube-segment"),
  title: z.string(),
  url: z.url(),
  metadata: z.object({
    videoId: z.string(),
    segmentUrl: z.url(),
    segmentName: z.string(),
    date: z.string(),
  }),
  entityRefs: z.array(entityRefSchema),
});

export const contentItemSchema = z.discriminatedUnion("type", [
  youtubeSegmentContentSchema,
]);

export type EntityRef = z.infer<typeof entityRefSchema>;
export type ContentItem = z.infer<typeof contentItemSchema>;

export type ContentRepository = {
  createSchema(): Promise<void>;
  upsert(items: ContentItem[]): Promise<void>;
  findByClusterId(clusterId: string): Promise<ContentItem[]>;
  findByAreaId(areaId: string): Promise<ContentItem[]>;
};
