import { ZoomTransform } from "d3";
import { CSSProperties, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import useSWR from "swr";
import { useShallow } from "zustand/react/shallow";
import { Cluster } from "../../api/model";
import { useArticleStore, useStore } from "../../store.ts";
import { useD3Zoom } from "../../useD3Zoom.ts";
import { useFlashState } from "../../useFlashState.ts";
import { useLanguage } from "../../useLanguage.ts";
import { useLayersOpacity } from "../../useLayersOpacity.ts";
import { Clusters, ClusterWithScaledPlace } from "./Clusters/Clusters.tsx";
import Label, { OnLabelClick } from "./Label/Label.tsx";

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

type Filter = {
  clusters: Cluster[];
  transform: ZoomTransform;
  limit: number;
  size: {
    width: number;
    height: number;
  };
  places: {
    visible: boolean;
    fontSize: number;
    opacity: number;
  };
};

const processClustersForViewport = (args: Filter) => {
  const clustersInViewport: ClusterWithScaledPlace[] = [];

  // Although .filter() would feel more natural, the regular for loop is way
  // faster since we can easily break the loop when we reach the limit.
  for (const point of args.clusters) {
    const screenX = args.transform.applyX(point.x);
    const screenY = args.transform.applyY(point.y);

    if (
      screenX >= 0 &&
      screenX <= args.size.width &&
      screenY >= 0 &&
      screenY <= args.size.height
    ) {
      const place =
        point.place && args.places.visible
          ? {
              ...point.place,
              fontSize: args.places.fontSize,
              opacity: args.places.opacity,
              offset: 20 / args.transform.k,
            }
          : null;
      clustersInViewport.push({
        ...point,
        place,
      });
      if (clustersInViewport.length >= args.limit) break;
    }
  }

  return clustersInViewport;
};

type Props = {
  size: {
    width: number;
    height: number;
  };
  on?: {
    labelClick?: OnLabelClick;
  };
};

export default function Map(props: Props) {
  const [
    areas,
    clusters,
    concepts,
    youtube,
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
      s.areas,
      s.clusters,
      s.concepts,
      s.youtubeVideos,
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
  const { language } = useLanguage();

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
    return areas.map((label) => {
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
        fontSize,
        opacity: labelOpacity,
        videos: youtube.get(label.id) ?? [],
      };
    });
  }, [
    youtube,
    areas,
    opacity.layer1,
    opacity.layer2,
    opacity.layer3,
    opacity.layer4,
    scaledFontSize.layer1,
    scaledFontSize.layer2,
    scaledFontSize.layer3,
    scaledFontSize.layer4,
  ]);

  const hasSearchResults = clustersToHighlight.length > 0;
  const clustersAsArray = useMemo(() => [...clusters.values()], [clusters]);
  const clustersInViewport = useMemo(() => {
    if (!transform) {
      return [];
    }

    const allClusters = hasSearchResults
      ? clustersToHighlight
          .map((id) => clusters.get(id))
          .filter((point) => point !== undefined)
      : clustersAsArray;
    const limit = hasSearchResults ? Infinity : maxDataPointsInViewport;

    return processClustersForViewport({
      clusters: allClusters,
      transform,
      limit,
      size: props.size,
      places: {
        visible: true,
        fontSize: scaledFontSize.layer4,
        opacity: opacity.layer4,
      },
    });
  }, [
    hasSearchResults,
    transform,
    clustersToHighlight,
    clustersAsArray,
    maxDataPointsInViewport,
    props.size,
    scaledFontSize.layer4,
    opacity.layer4,
    clusters,
  ]);

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

  const ripple = useFlashState(clustersToHighlight);

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
        <Clusters
          clusters={clustersInViewport}
          concepts={concepts}
          mode={mapMode}
          ripple={hasSearchResults && ripple}
        />
        {labelsScaled.map((label) => (
          <Label
            {...label}
            id={label.key}
            key={label.key}
            onClick={({ text, videos }) => {
              setVideos(videos);
              void fetchLocalArticle(text, language);
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
