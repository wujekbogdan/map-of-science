import { v5 as uuidv5 } from "uuid";
import { type ContentItem, contentItemSchema } from "@map-of-science/atlas";

type YoutubeRow = {
  video_id: string;
  video_title: string;
  date: string;
  segment_number: string;
  segment_timestamp: string;
  segment_url: string;
  segment_topic: string;
  reference: string;
  article_link: string;
  segment_name: string;
  doi: string;
  open_alex_id: string;
  classification: string;
};

// Stable namespace for deterministic content UUIDs. Do not change once
// generated IDs are persisted.
const CONTENT_NAMESPACE = "6f0a1c4e-1b2a-4e4a-9d90-2f9b6a1c4e11";

const parseEntityRefs = (classification: string) =>
  classification
    .split("|")
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => ({ type: "area" as const, id }));

export const buildContentItems = (rows: YoutubeRow[]): ContentItem[] =>
  rows.map((row) => {
    const key = `${row.video_id}#${row.segment_number}`;
    return contentItemSchema.parse({
      id: uuidv5(key, CONTENT_NAMESPACE),
      type: "youtube-segment",
      title: row.segment_name,
      url: row.segment_url,
      metadata: {
        videoId: row.video_id,
        segmentUrl: row.segment_url,
        segmentName: row.segment_name,
        date: row.date,
      },
      entityRefs: parseEntityRefs(row.classification),
    });
  });
