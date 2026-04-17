import { create } from "zustand";
import { combine } from "zustand/middleware";

type Zoom = { x: number; y: number; scale: number };
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

type MapMode = "regular" | "growth";

const partialDefaults = {
  mapMode: "regular" as MapMode,
  growthRatingColors: {
    start: { r: 24, g: 100, b: 171 },
    middle: { r: 255, g: 255, b: 255 },
    end: { r: 201, g: 42, b: 42 },
  },
  zoomStepFactor: 1.6,
  mapSize: { width: 0, height: 0 },
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
  temp__svgScaleFactor: 0.0581,
  temp__svgOffset: { x: -16.0, y: 27 },
};

type PartialDefaults = typeof partialDefaults;
type State = PartialDefaults & {
  currentZoom: Zoom | null;
  desiredZoom: Zoom | null;
};

const defaults: State = {
  ...partialDefaults,
  desiredZoom: null,
  currentZoom: null,
};

export const useMapStore = create(
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
    setGrowthRatingColors: (colors: Colors) => {
      set({ growthRatingColors: colors });
    },
    setMapMode: (mode: MapMode) => {
      set({ mapMode: mode });
    },
    temp__setSvgScaleFactor: (svgScaleFactor: number) => {
      set({ temp__svgScaleFactor: svgScaleFactor });
    },
    temp__setSvgOffset: (svgOffset: { x: number; y: number }) => {
      set({ temp__svgOffset: svgOffset });
    },
  })),
);
