import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { CSSProperties, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useShallow } from "zustand/react/shallow";
import { useTRPC } from "../../api-client/index.ts";
import { useArticleStore } from "../../article/articleStore.ts";
import { transformToBbox } from "../../map/bbox.ts";
import { useMapStore } from "../../map/mapStore.ts";
import { pickClustersToRender } from "../../map/pickClustersToRender.ts";
import { useSelectionStore } from "../../map/selectionStore.ts";
import { useD3Zoom } from "../../map/useD3Zoom.ts";
import { useFlashState } from "../../map/useFlashState.ts";
import { useLayersOpacity } from "../../map/useLayersOpacity.ts";
import { useLanguage } from "../../useLanguage.ts";
import { Clusters } from "./Clusters/Clusters.tsx";
import Label, { OnLabelClick } from "./Label/Label.tsx";

const BBOX_DEBOUNCE_MS = 150;

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

type Props = {
  size: {
    width: number;
    height: number;
  };
  on?: {
    labelClick?: OnLabelClick;
  };
};

// TODO: split into a data container and a pure view. useQuery lives here only
// because the bbox depends on transform owned by this component. Lift
// transform to the store, move the fetch into a container wrapper.
export default function Map(props: Props) {
  const [
    scaleFactor,
    fontSize,
    desiredZoom,
    maxDataPointsInViewport,
    svgScaleFactor,
    svgOffset,
    mapMode,
  ] = useMapStore(
    useShallow((s) => [
      s.scaleFactor,
      s.fontSize,
      s.desiredZoom,
      s.maxDataPointsInViewport,
      s.temp__svgScaleFactor,
      s.temp__svgOffset,
      s.mapMode,
    ]),
  );
  const selectedClusters = useSelectionStore((s) => s.selectedClusters);
  const { language } = useLanguage();

  const fetchAreaArticle = useArticleStore((s) => s.fetchAreaArticle);

  const svgRoot = useRef<SVGSVGElement>(null);
  const [mapVisibility, setMapVisibility] = useState<"visible" | "hidden">(
    "hidden",
  );
  const { data: mapSvgUrl } = useQuery({
    queryKey: ["map-svg"],
    queryFn: fetchMapSvg,
    staleTime: Infinity,
  });

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

  const bbox = useMemo(
    () => (transform ? transformToBbox(transform, props.size) : null),
    [transform, props.size],
  );
  const debouncedBbox = useDebounce(bbox, BBOX_DEBOUNCE_MS);

  const trpc = useTRPC();
  const { data: viewportClusters = [] } = useQuery(
    trpc.cluster.viewport.queryOptions(
      debouncedBbox
        ? { bbox: debouncedBbox, limit: maxDataPointsInViewport }
        : { bbox: { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } } },
      {
        enabled: debouncedBbox !== null,
        placeholderData: keepPreviousData,
      },
    ),
  );

  const clustersToRender = useMemo(
    () =>
      pickClustersToRender(viewportClusters, [...selectedClusters.values()]),
    [viewportClusters, selectedClusters],
  );

  const { data: areas = [] } = useQuery(
    trpc.area.viewport.queryOptions(
      debouncedBbox
        ? { bbox: debouncedBbox }
        : { bbox: { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } } },
      {
        enabled: debouncedBbox !== null,
        placeholderData: keepPreviousData,
      },
    ),
  );

  const labelsScaled = useMemo(() => {
    const layers: Record<1 | 2 | 3 | 4, { fontSize: number; opacity: number }> =
      {
        1: { fontSize: scaledFontSize.layer1, opacity: opacity.layer1 },
        2: { fontSize: scaledFontSize.layer2, opacity: opacity.layer2 },
        3: { fontSize: scaledFontSize.layer3, opacity: opacity.layer3 },
        4: { fontSize: scaledFontSize.layer4, opacity: opacity.layer4 },
      };

    return areas.flatMap((area) => {
      const layer = layers[area.tier as 1 | 2 | 3 | 4];
      if (!layer) return [];
      return [
        {
          id: area.id,
          key: area.id,
          text: area.name,
          x: area.position.x,
          y: area.position.y,
          level: area.tier as 1 | 2 | 3 | 4,
          fontSize: layer.fontSize,
          opacity: layer.opacity,
        },
      ];
    });
  }, [
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

  const hasSelection = selectedClusters.size > 0;
  const ripple = useFlashState(selectedClusters);

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
          clusters={clustersToRender}
          label={{
            fontSize: scaledFontSize.layer4,
            opacity: opacity.layer4,
            offset: 15 / zoom,
          }}
          mode={mapMode}
          ripple={hasSelection && ripple}
        />
        {labelsScaled.map((label) => (
          <Label
            {...label}
            id={label.key}
            key={label.key}
            onClick={({ id, text }) => {
              void fetchAreaArticle(id, text, language);
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
