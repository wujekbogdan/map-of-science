import { create } from "zustand";
import { combine } from "zustand/middleware";
import { fetchArticle } from "./api";
import {
  AreaLabel,
  AreaLabelI18n,
  Concept,
  DataPoint,
  YoutubeVideo,
} from "./api/model";

type Zoom = { x: number; y: number; scale: number };
type PartialDefaults = typeof partialDefaults;
type State = PartialDefaults & {
  currentZoom: Zoom | null;
  desiredZoom: Zoom | null;
};
type Size = {
  width: number;
  height: number;
};

export type RGB = {
  r: number;
  g: number;
  b: number;
};

type Colors = {
  start: RGB;
  middle: RGB;
  end: RGB;
};

const partialDefaults = {
  growthRatingColors: {
    start: {
      r: 24,
      g: 100,
      b: 171,
    },
    middle: {
      r: 255,
      g: 255,
      b: 255,
    },
    end: {
      r: 201,
      g: 42,
      b: 42,
    },
  },
  dataPoints: new Map<number, DataPoint>(),
  concepts: new Map<number, Concept>(),
  youtubeVideos: new Map<string, YoutubeVideo[]>(),
  labels: new Map<string, AreaLabel>(),
  labelsI18n: new Map<string, AreaLabelI18n>(),
  pointsToHighlight: [] as number[],
  zoomStepFactor: 1.6,
  mapSize: {
    width: 0,
    height: 0,
  },
  fontSize: {
    layer1: 16,
    layer2: 12.8,
    layer3: 6.4,
    layer4: 3,
  },
  scaleFactor: {
    min: 0.5,
    max: 16,
    zoom: 0.5,
  },
  maxDataPointsInViewport: 500,
  temp__svgScaleFactor: 0.058,
  temp__svgOffset: {
    x: -16.6,
    y: 27,
  },
};

const defaults: State = {
  ...partialDefaults,
  desiredZoom: null,
  currentZoom: null,
};

// TODO: break the main store into per-feature stores
// https://github.com/wujekbogdan/map-of-science/issues/61
export const useStore = create(
  combine(defaults, (set) => ({
    setDesiredZoom: (zoom: Zoom | null) => {
      set({ desiredZoom: zoom });
    },
    setCurrentZoom: (zoom: Zoom | null) => {
      set({ currentZoom: zoom });
    },
    setMapSize: (size: Size) => {
      set({ mapSize: size });
    },
    setZoomStepFactor: (zoomStepFactor: number) => {
      set({ zoomStepFactor });
    },
    setFontSize: (
      layer: keyof typeof defaults.fontSize,
      size: number | string,
    ) => {
      const parsedSize = typeof size === "string" ? parseFloat(size) : size;
      set((state) => ({
        fontSize: {
          ...state.fontSize,
          [layer]: parsedSize || defaults.fontSize[layer],
        },
      }));
    },
    setScaleFactor: (
      factor: keyof typeof defaults.scaleFactor,
      value: number | string,
    ) => {
      const parsedValue = typeof value === "string" ? parseFloat(value) : value;
      set((state) => ({
        scaleFactor: {
          ...state.scaleFactor,
          [factor]: parsedValue || defaults.scaleFactor[factor],
        },
      }));
    },
    setMaxDataPointsInViewport: (maxDataPointsInViewport: number) => {
      set({ maxDataPointsInViewport });
    },
    setDataPoints: (dataPoints: Map<number, DataPoint>) => {
      set({ dataPoints });
    },
    setConcepts: (concepts: Map<number, Concept>) => {
      set({ concepts });
    },
    setYoutubeVideos: (youtubeVideos: Map<string, YoutubeVideo[]>) => {
      set({ youtubeVideos });
    },
    setLabels: (labels: Map<string, AreaLabel>) => {
      set({ labels });
    },
    setLabelsI18n: (labelsI18n: Map<string, AreaLabelI18n>) => {
      set({ labelsI18n });
    },
    setPointsToHighlight: (clusterIds: number[]) => {
      set({ pointsToHighlight: clusterIds });
    },
    setGrowthRatingColors: (colors: Colors) => {
      set({
        growthRatingColors: colors,
      });
    },
    temp__setSvgScaleFactor: (svgScaleFactor: number) => {
      set({ temp__svgScaleFactor: svgScaleFactor });
    },
    temp__setSvgOffset: (svgOffset: { x: number; y: number }) => {
      set({ temp__svgOffset: svgOffset });
    },
  })),
);

type ArticleState =
  | { id: null; type: null; article: null; videos: YoutubeVideo[] }
  | { id: null; type: "local"; article: string | null; videos: YoutubeVideo[] }
  | { id: number; type: "iframe"; article: null; videos: YoutubeVideo[] };

type ArticleActions = {
  reset: () => void;
  setRemoteArticleId: (id: number) => void;
  fetchLocalArticle: (label: string) => Promise<void>;
  setVideos: (videos: YoutubeVideo[]) => void;
};

export const useArticleStore = create<ArticleState & ArticleActions>((set) => ({
  id: null,
  type: null,
  article: null,
  // TODO: Videos and local articles should not be handled separately.
  // Fetch logic should be encapsulated in the store, so that videos and articles can be fetched together rather
  // than set from the outside.
  videos: [],
  reset: () => {
    set({ id: null, type: null, article: null, videos: [] });
  },
  setRemoteArticleId: (id: number) => {
    set({ id, type: "iframe", article: null });
  },
  fetchLocalArticle: async (label: string) => {
    const articleHTML = await fetchArticle(label);
    set({ id: null, type: "local", article: articleHTML });
  },
  setVideos: (videos: YoutubeVideo[]) => {
    set({ videos, id: null, type: "local" });
  },
}));
