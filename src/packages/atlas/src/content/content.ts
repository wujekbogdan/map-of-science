import { z } from "zod";

export const entityRefSchema = z
  .object({
    type: z
      .enum(["cluster", "area"])
      .describe("Which kind of entity is referenced."),
    id: z.string().describe("The referenced entity's id."),
  })
  .describe("A typed reference to another entity (cluster or area).");

export const youtubeSegmentContentSchema = z
  .object({
    id: z.string().describe("Unique content item identifier."),
    type: z.literal("youtube-segment"),
    title: z.string().describe("Display title."),
    url: z.url().describe("Link to the content."),
    metadata: z
      .object({
        videoId: z.string().describe("YouTube video ID."),
        segmentUrl: z.url().describe("Link to the segment (with timestamp)."),
        segmentName: z.string().describe("Name of the segment."),
        date: z.string().describe("Video publication date."),
      })
      .describe("YouTube-specific data for the segment."),
    entityRefs: z
      .array(entityRefSchema)
      .describe("Entities this content is attached to."),
  })
  .describe("A segment of a YouTube video attached to one or more entities.");

export const contentItemSchema = z
  .discriminatedUnion("type", [youtubeSegmentContentSchema])
  .describe(
    "Content attached to one or more entities. Currently only YouTube segments, extensible to other types.",
  );

export type EntityRef = z.infer<typeof entityRefSchema>;
export type ContentItem = z.infer<typeof contentItemSchema>;

/* Storage interface for content items. */
export type ContentRepository = {
  /* Set up content storage. Run once. */
  createSchema(): Promise<void>;
  /* Add or update content items. */
  upsert(items: ContentItem[]): Promise<void>;
  /* Get all content items linked to a cluster. */
  findByClusterId(clusterId: string): Promise<ContentItem[]>;
  /* Get all content items linked to an area. */
  findByAreaId(areaId: string): Promise<ContentItem[]>;
};
