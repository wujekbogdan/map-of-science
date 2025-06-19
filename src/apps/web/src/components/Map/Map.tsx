import { ZoomTransform } from "d3";
import { CSSProperties, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import useSWR from "swr";
import { useShallow } from "zustand/react/shallow";
import {
  AreaLabel,
  AreaLabelI18n,
  Concept,
  DataPoint as Point,
  YoutubeVideo,
} from "../../api/model";
import { config } from "../../config.ts";
import { useArticleStore, useStore } from "../../store.ts";
import { useD3Zoom } from "../../useD3Zoom.ts";
import { useLayersOpacity } from "../../useLayersOpacity.ts";
import { DataPoints } from "./DataPoints/DataPoints.tsx";
import Label, { OnLabelClick } from "./Label.tsx";

const fetchMapSvg = async () => {
  // At this point only the URL is resolved, the SVG is not yet loaded.
  const url = (await import("./map.svg")).default;

  // We need to ensure that the SVG is loaded before we return the URL.
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(url);
    img.onerror = reject;
  });
};

const filterDataByViewport = (
  dataPoints: Point[],
  transform: ZoomTransform,
  limit: number,
  size: {
    width: number;
    height: number;
  },
) => {
  const dataInViewport: Point[] = [];

  // Although .filter() would feel more natural, the regular for loop is way
  // faster since we can easily break the loop when we reach the limit.
  for (const point of dataPoints) {
    const screenX = transform.applyX(point.x);
    const screenY = transform.applyY(point.y);

    if (
      screenX >= 0 &&
      screenX <= size.width &&
      screenY >= 0 &&
      screenY <= size.height
    ) {
      dataInViewport.push(point);
      if (dataInViewport.length >= limit) break;
    }
  }

  return dataInViewport;
};

type Props = {
  size: {
    width: number;
    height: number;
  };
  labels: Map<string, AreaLabel>;
  labelsI18n: Map<string, AreaLabelI18n>;
  dataPoints: Map<number, Point>;
  concepts: Map<number, Concept>;
  youtube: Map<string, YoutubeVideo[]>;
  on?: {
    labelClick?: OnLabelClick;
  };
};

export default function Map(props: Props) {
  const { labels } = props;
  const [
    scaleFactor,
    fontSize,
    desiredZoom,
    maxDataPointsInViewport,
    clustersToHighlight,
    svgScaleFactor,
    svgOffset,
    mapMode,
  ] = useStore(
    useShallow((s) => [
      s.scaleFactor,
      s.fontSize,
      s.desiredZoom,
      s.maxDataPointsInViewport,
      s.pointsToHighlight,
      s.temp__svgScaleFactor,
      s.temp__svgOffset,
      s.mapMode,
    ]),
  );

  const [fetchLocalArticle, setVideos] = useArticleStore(
    useShallow((s) => [s.fetchLocalArticle, s.setVideos]),
  );

  const svgRoot = useRef<SVGSVGElement>(null);
  const [mapVisibility, setMapVisibility] = useState<"visible" | "hidden">(
    "hidden",
  );
  const { data: mapSvgUrl } = useSWR("map-svg", fetchMapSvg);

  const { transform, zoom } = useD3Zoom({
    svg: svgRoot,
    initialZoom: {
      x: props.size.width / 2,
      y: props.size.height / 2,
      scale: 1,
    },
    desiredZoom,
    initialized: () => {
      setMapVisibility("visible");
    },
  });
  const transformValue = transform ? transform.toString() : "";
  const opacity = useLayersOpacity(zoom);

  const scaleFontSize = (size: number) => {
    const baseScaleFactor = 1 / zoom;
    const factor = Math.sqrt(
      Math.min(
        Math.max(scaleFactor.min, zoom * scaleFactor.zoom),
        scaleFactor.max,
      ),
    );

    return size * baseScaleFactor * factor;
  };
  const scaledFontSize = {
    layer1: scaleFontSize(fontSize.layer1),
    layer2: scaleFontSize(fontSize.layer2),
    layer3: scaleFontSize(fontSize.layer3),
    layer4: scaleFontSize(fontSize.layer4),
  };

  const labelsScaled = useMemo(() => {
    return [...labels.values()].map((label) => {
      const { fontSize, opacity: labelOpacity } = {
        1: {
          fontSize: scaledFontSize.layer1,
          opacity: opacity.layer1,
        },
        2: {
          fontSize: scaledFontSize.layer2,
          opacity: opacity.layer2,
        },
        3: {
          fontSize: scaledFontSize.layer3,
          opacity: opacity.layer3,
        },
        4: {
          fontSize: scaledFontSize.layer4,
          opacity: opacity.layer4,
        },
      }[label.level];

      return {
        ...label,
        key: label.id,
        text: props.labelsI18n.get(label.id)?.[config.LANG] ?? label.id,
        fontSize,
        opacity: labelOpacity,
        videos: props.youtube.get(label.id) ?? [],
      };
    });
  }, [
    labels,
    opacity.layer1,
    opacity.layer2,
    opacity.layer3,
    opacity.layer4,
    props.labelsI18n,
    props.youtube,
    scaledFontSize.layer1,
    scaledFontSize.layer2,
    scaledFontSize.layer3,
    scaledFontSize.layer4,
  ]);

  const dataInViewport = useMemo(() => {
    return !transform
      ? []
      : filterDataByViewport(
          [...props.dataPoints.values()],
          transform,
          maxDataPointsInViewport,
          props.size,
        );
  }, [maxDataPointsInViewport, props.dataPoints, props.size, transform]);

  const highlightedPoints = useMemo(() => {
    const pointsToHighlight = clustersToHighlight
      .map((id) => props.dataPoints.get(id))
      .filter((point) => point !== undefined);

    return !transform
      ? []
      : filterDataByViewport(
          pointsToHighlight,
          transform,
          Infinity,
          props.size,
        );
  }, [clustersToHighlight, transform, props.size, props.dataPoints]);

  const mapSvgBackgroundCss = useMemo(() => {
    if (!transform || !mapSvgUrl) {
      return {};
    }

    // TODO: This is a copy/paste from the SVG. Let's parse it out from the SVG instead.
    const viewBox = {
      width: 18340.723,
      height: 18561.087,
    };

    // const [xMin, xMax] = extent(
    //   [...props.dataPoints.values()],
    //   (point) => point.x,
    // ) as [number, number];
    // const xRange = xMax - xMin;
    // const scaleFactor = xRange / viewBox.width;
    // scaleFactor = 0.0584202596593384;
    // TODO: We can't fully rely on the extent of the data points and the ratio between data points range and viewBox
    // width because this calculation doesn't include the padding around the map
    // We use the calculated scale factor as a base value that needs some manual adjustment.
    // Let's sort it out so that we can rely on calculated values only.
    const SCALE_FACTOR = svgScaleFactor;
    const offset = svgOffset;
    const scale = SCALE_FACTOR * transform.k;
    const scaledWidth = viewBox.width * scale;
    const scaledHeight = viewBox.height * scale;
    const bgX = transform.x + offset.x * transform.k - scaledWidth / 2;
    const bgY = transform.y + offset.y * transform.k - scaledHeight / 2;

    return {
      backgroundImage: `url(${mapSvgUrl})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${scaledWidth}px ${scaledHeight}px`,
      backgroundPosition: `${bgX}px ${bgY}px`,
    };
  }, [transform, svgOffset, svgScaleFactor, mapSvgUrl]);

  return (
    <MapSvg
      ref={svgRoot}
      style={mapSvgBackgroundCss}
      $visibility={mapVisibility}
      $zoom={zoom}
      width={props.size.width}
      height={props.size.height}
    >
      <g transform={transformValue}>
        <DataPoints
          points={dataInViewport}
          concepts={props.concepts}
          mode={mapMode}
        />
        <DataPoints
          points={highlightedPoints}
          forcedSize={true}
          concepts={props.concepts}
          mode={mapMode}
        />
        {labelsScaled.map((label) => (
          <Label
            {...label}
            id={label.key}
            key={label.key}
            onClick={({ text, videos }) => {
              setVideos(videos);
              void fetchLocalArticle(text);
            }}
          />
        ))}
      </g>
    </MapSvg>
  );
}

const MapSvg = styled.svg.attrs<{
  $visibility: "visible" | "hidden";
  $zoom: number;
}>((props) => ({
  style: {
    "--zoom-scale": props.$zoom,
  } as CSSProperties,
}))`
  visibility: ${(props) => props.$visibility};
  display: block;

  .fil0 {
    fill: #4b9232;
  }

  .fil4 {
    fill: #5aa53d;
  }

  .fil1 {
    fill: #7dbc62;
  }

  .fil2 {
    fill: #a3c796;
  }

  .fil3 {
    fill: #d6ebce;
  }
`;
