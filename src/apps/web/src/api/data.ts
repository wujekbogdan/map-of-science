import { z } from "zod";
import {
  DataSchema,
  ConceptSchema,
  AreaSchema,
  YoutubeVideoSchema,
  YoutubeVideo,
  AreaI18nSchema,
} from "./model";
import { loadAsArray, loadAsMap } from "./utils.ts";

export type Lang = "en-US" | "pl-PL";
export type AreaLocalized = Awaited<ReturnType<typeof loadAreas>>[number];

const loadAreas = async (lang: Lang) => {
  const i18n = await loadAsMap({
    url: new URL("../../asset/areas_i18n.tsv", import.meta.url).href,
    schema: AreaI18nSchema(z),
    getKey: (item) => item.id,
  });

  const areas = await loadAsArray({
    url: new URL("../../asset/areas.tsv", import.meta.url).href,
    schema: AreaSchema(z),
  });

  return areas.map(({ ...area }) => ({
    ...area,
    text: i18n.get(area.id)?.[lang] ?? area.id,
  }));
};

// TODO: move this out from here. It does not belong to the API layer.
// It's more of a service layer.
// https://github.com/wujekbogdan/map-of-science/issues/57
export const loadData = async (lang: Lang) => {
  const [concepts, dataPoints, youtube, areas] = await Promise.all([
    loadAsMap({
      url: new URL("../../asset/keys.tsv", import.meta.url).href,
      schema: ConceptSchema(z),
      getKey: (item) => item.index,
    }),
    loadAsMap({
      url: new URL("../../asset/data.tsv", import.meta.url).href,
      schema: DataSchema(z),
      getKey: (item) => item.clusterId,
    }),
    loadAsArray({
      url: new URL("../../asset/youtube.tsv", import.meta.url).href,
      schema: YoutubeVideoSchema(z),
    }),
    loadAreas(lang),
  ]);

  const dataPointsOrdered = new Map(
    [...dataPoints.entries()].sort(
      ([, a], [, b]) => b.numRecentArticles - a.numRecentArticles,
    ),
  );

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
    concepts,
    areas,
    dataPoints: dataPointsOrdered,
    youtube: labelToVideos,
  };
};
