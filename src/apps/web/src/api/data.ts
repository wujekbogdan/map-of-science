import { z } from "zod";
import {
  DataSchema,
  ConceptSchema,
  AreaLabelSchema,
  YoutubeVideoSchema,
  YoutubeVideo,
  AreaLabelI18nSchema,
} from "./model";
import { loadAsArray, loadAsMap } from "./utils.ts";

// TODO: move this out from here. It does not belong to the API layer.
// It's more of a service layer.
// https://github.com/wujekbogdan/map-of-science/issues/57
export const loadData = async () => {
  const [concepts, dataPoints, youtube, labels, labelsI18n] = await Promise.all(
    [
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
      loadAsMap({
        url: new URL("../../asset/area_labels.tsv", import.meta.url).href,
        schema: AreaLabelSchema(z),
        getKey: (item) => item.id,
      }),
      loadAsMap({
        url: new URL("../../asset/labels_i18n.tsv", import.meta.url).href,
        schema: AreaLabelI18nSchema(z),
        getKey: (item) => item.id,
      }),
    ],
  );

  const dataPointsOrdered = new Map(
    [...dataPoints.entries()].sort(
      ([, a], [, b]) => b.numRecentArticles - a.numRecentArticles,
    ),
  );

  // TODO: Indexing videos by labelId isn't great. We need to give labels proper ids.
  const labelToVideos = new Map<string, YoutubeVideo[]>(
    Object.entries(
      youtube.reduce<Record<string, YoutubeVideo[]>>((acc, video) => {
        return video.labelIds.reduce<Record<string, YoutubeVideo[]>>(
          (innerAcc, labelId) => ({
            ...innerAcc,
            [labelId]: [...(innerAcc[labelId] ?? []), video],
          }),
          acc,
        );
      }, {}),
    ),
  );

  return {
    concepts,
    labels,
    dataPoints: dataPointsOrdered,
    youtube: labelToVideos,
    labelsI18n,
  };
};
