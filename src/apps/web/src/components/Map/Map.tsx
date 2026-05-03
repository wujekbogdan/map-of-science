import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTRPC } from "../../api-client/index.ts";
import { useArticleStore } from "../../article/articleStore.ts";
import { useMapStore } from "../../map/mapStore.ts";
import { pickClustersToRender } from "../../map/pickClustersToRender.ts";
import { useSelectionStore } from "../../map/selectionStore.ts";
import { useFlashState } from "../../map/useFlashState.ts";
import { useLayersOpacity } from "../../map/useLayersOpacity.ts";
import {
  useBindZoomable,
  useMapView,
  useMapViewBbox,
  useMapViewIsReady,
  useMapViewScale,
  useMapViewTransform,
} from "../../map/view/hooks.ts";
import { useLanguage } from "../../useLanguage.ts";
import { Clusters } from "./Clusters/Clusters.tsx";
import Label from "./Label/Label.tsx";

export default function Map() {
  const [scaleFactor, fontSize, maxDataPointsInViewport, mapMode] = useMapStore(
    useShallow((s) => [
      s.scaleFactor,
      s.fontSize,
      s.maxDataPointsInViewport,
      s.mapMode,
    ]),
  );
  const selectedClusters = useSelectionStore((s) => s.selectedClusters);
  const { language } = useLanguage();
  const fetchAreaArticle = useArticleStore((s) => s.fetchAreaArticle);

  const view = useMapView();
  const isReady = useMapViewIsReady();
  const scale = useMapViewScale();
  const liveTransform = useMapViewTransform();
  const bbox = useMapViewBbox();

  const foregroundRef = useRef<SVGGElement>(null);
  useBindZoomable(foregroundRef);

  useEffect(() => {
    if (!isReady) return;
    view.panTo({ x: 0, y: 0 }, { animate: false });
  }, [isReady, view]);

  const opacity = useLayersOpacity(scale);

  const scaleFontSize = (size: number) => {
    const baseScaleFactor = 1 / scale;
    const factor = Math.sqrt(
      Math.min(
        Math.max(scaleFactor.min, scale * scaleFactor.zoom),
        scaleFactor.max,
      ),
    );
    return size * baseScaleFactor * factor;
  };
  const scaledFontSize = {
    layer1: scaleFontSize(fontSize.layer1),
    layer2: scaleFontSize(fontSize.layer2),
    layer3: scaleFontSize(fontSize.layer3),
  };

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
    const layers: Record<1 | 2 | 3, { fontSize: number; opacity: number }> = {
      1: { fontSize: scaledFontSize.layer1, opacity: opacity.layer1 },
      2: { fontSize: scaledFontSize.layer2, opacity: opacity.layer2 },
      3: { fontSize: scaledFontSize.layer3, opacity: opacity.layer3 },
    };

    return areas.flatMap((area) => {
      const layer = layers[area.tier as 1 | 2 | 3];
      if (!layer) return [];
      return [
        {
          id: area.id,
          key: area.id,
          text: area.name,
          x: area.position.x,
          y: area.position.y,
          level: area.tier as 1 | 2 | 3,
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
    scaledFontSize.layer1,
    scaledFontSize.layer2,
    scaledFontSize.layer3,
  ]);

  const hasSelection = selectedClusters.size > 0;
  const ripple = useFlashState(selectedClusters);

  return (
    <g ref={foregroundRef} style={{ "--zoom-scale": scale } as CSSProperties}>
      <Clusters
        clusters={clustersToRender}
        transform={liveTransform}
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
  );
}
