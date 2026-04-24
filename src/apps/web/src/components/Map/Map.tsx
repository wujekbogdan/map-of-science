import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CSSProperties, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useShallow } from "zustand/react/shallow";
import { useTRPC } from "../../api-client/index.ts";
import { useArticleStore } from "../../article/articleStore.ts";
import { useMapStore } from "../../map/mapStore.ts";
import { pickClustersToRender } from "../../map/pickClustersToRender.ts";
import { useSelectionStore } from "../../map/selectionStore.ts";
import { useFlashState } from "../../map/useFlashState.ts";
import { useLayersOpacity } from "../../map/useLayersOpacity.ts";
import { useZoom } from "../../map/zoom/useZoom.ts";
import { useLanguage } from "../../useLanguage.ts";
import { Clusters } from "./Clusters/Clusters.tsx";
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
  const foregroundRef = useRef<SVGGElement>(null);
  const [mapVisibility, setMapVisibility] = useState<"visible" | "hidden">(
    "hidden",
  );
  const { data: mapSvgUrl } = useQuery({
    queryKey: ["map-svg"],
    queryFn: fetchMapSvg,
    staleTime: Infinity,
  });

  const zoom = useZoom({
    svg: svgRoot,
    initialZoom: {
      x: props.size.width / 2,
      y: props.size.height / 2,
      scale: 1,
    },
    desiredZoom,
    onInitialized: () => {
      setMapVisibility("visible");
    },
  });

  zoom.useZoomed(foregroundRef);
  zoom.useZoomedBackground(svgRoot, {
    imageUrl: mapSvgUrl,
    scaleFactor: svgScaleFactor,
    offset: svgOffset,
  });
  zoom.usePublish();

  const opacity = useLayersOpacity(zoom.scale);

  const scaleFontSize = (size: number) => {
    const baseScaleFactor = 1 / zoom.scale;
    const factor = Math.sqrt(
      Math.min(
        Math.max(scaleFactor.min, zoom.scale * scaleFactor.zoom),
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

  const bbox = zoom.useBbox(props.size);

  const trpc = useTRPC();
  const { data: viewportClusters = [] } = useQuery(
    trpc.cluster.viewport.queryOptions(
      bbox
        ? { bbox, limit: maxDataPointsInViewport }
        : { bbox: { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } } },
      {
        enabled: bbox !== null,
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
      bbox
        ? { bbox }
        : { bbox: { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } } },
      {
        enabled: bbox !== null,
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

  const hasSelection = selectedClusters.size > 0;
  const ripple = useFlashState(selectedClusters);

  return (
    <MapSvg
      ref={svgRoot}
      $visibility={mapVisibility}
      $zoom={zoom.scale}
      width={props.size.width}
      height={props.size.height}
    >
      <g ref={foregroundRef}>
        <Clusters
          clusters={clustersToRender}
          label={{
            fontSize: scaledFontSize.layer4,
            opacity: opacity.layer4,
            offset: 15 / zoom.scale,
          }}
          transform={zoom.transform}
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
