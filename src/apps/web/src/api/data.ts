import { z } from "zod";
import { YoutubeVideoSchema, YoutubeVideo } from "./model";
import { loadAsArray } from "./utils.ts";

// TODO: Drop this module entirely once the video panel is removed (Chunk 5).
export const loadData = async () => {
  const youtube = await loadAsArray({
    url: new URL("../../asset/youtube.tsv", import.meta.url).href,
    schema: YoutubeVideoSchema(z),
  });

  const labelToVideos = new Map<string, YoutubeVideo[]>(
    Object.entries(
      youtube.reduce<Record<string, YoutubeVideo[]>>((acc, video) => {
        return video.labelIds.reduce<Record<string, YoutubeVideo[]>>(
          (innerAcc, labelId) => {
            const existingVideos = innerAcc[labelId] ?? [];
            const videoExists = existingVideos.some(
              (existingVideo) => existingVideo.videoId === video.videoId,
            );

            return {
              ...innerAcc,
              [labelId]: videoExists
                ? existingVideos
                : [...existingVideos, video],
            };
          },
          acc,
        );
      }, {}),
    ),
  );

  return {
    youtube: labelToVideos,
  };
};
