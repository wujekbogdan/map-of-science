import { z } from "zod";
import {
  ConceptSchema,
  AreaSchema,
  PlaceSchema,
  YoutubeVideoSchema,
  YoutubeVideo,
  MapEntity18nSchema,
  MakeClustersSchema,
} from "./model";
import { loadAsArray, loadAsMap } from "./utils.ts";

export type Lang = "en" | "pl";
type Entities = Awaited<ReturnType<typeof loadMapEntities>>;
export type AreaLocalized = Entities["areas"][number];

const loadMapEntities = async (lang: Lang) => {
  const langCode = (
    {
      en: "en-US",
      pl: "pl-PL",
    } as const
  )[lang];

  const i18n = await loadAsMap({
    url: new URL("../../asset/map_entities_i18n.tsv", import.meta.url).href,
    schema: MapEntity18nSchema(z),
    getKey: (item) => item.id,
  });

  const localize = <T extends { id: string }[]>(
    entities: T,
  ): (T[number] & { text: string })[] =>
    entities.map((entity) => ({
      ...entity,
      text: i18n.get(entity.id)?.[langCode] ?? entity.id,
    }));

  const [areas, places] = await Promise.all([
    loadAsArray({
      url: new URL("../../asset/areas.tsv", import.meta.url).href,
      schema: AreaSchema(z),
    }),
    loadAsArray({
      url: new URL("../../asset/places.tsv", import.meta.url).href,
      schema: PlaceSchema(z),
    }),
  ]);

  return {
    areas: localize(areas),
    places: new Map(localize(places).map((place) => [place.clusterId, place])),
  };
};

// TODO: move this out from here. It does not belong to the API layer.
// It's more of a service layer.
// https://github.com/wujekbogdan/map-of-science/issues/57
export const loadData = async (lang: Lang) => {
  const { areas, places } = await loadMapEntities(lang);
  const ClustersSchema = MakeClustersSchema(places);
  const [concepts, clusters, youtube] = await Promise.all([
    loadAsMap({
      url: new URL("../../asset/keys.tsv", import.meta.url).href,
      schema: ConceptSchema(z),
      getKey: (item) => item.index,
    }),
    loadAsMap({
      url: new URL("../../asset/clusters.tsv", import.meta.url).href,
      schema: ClustersSchema(z),
      getKey: (item) => item.clusterId,
    }),
    loadAsArray({
      url: new URL("../../asset/youtube.tsv", import.meta.url).href,
      schema: YoutubeVideoSchema(z),
    }),
  ]);

  const clustersOrdered = new Map(
    [...clusters.entries()].sort(
      ([, a], [, b]) => b.articlesCount - a.articlesCount,
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
    clusters: clustersOrdered,
    youtube: labelToVideos,
  };
};
