import mitt from "mitt";
import { ScaleLinear } from "d3";

export type Events = {
  // TODO: This name isn't great. In the future it will get renamed to
  // 'zoom' because, in the end, it's the zoom that's being updated.
  // For now, though, it's being emitted only from label.js, so the name is fine
  // for now.
  labelsUpdate: {
    visibility: [number, number, number, number];
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
    zoom: number;
  };
  cityLabelsLoaded: {
    label: string;
    clusterId: number;
    x: number;
    y: number;
  }[];
};

export const eventBus = mitt<Events>();
