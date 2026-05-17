import { getRouteApi, useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Trans } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { IframeArticle } from "../components/Article/IframeArticle.tsx";
import { ContextPanel } from "../components/ContextPanel/ContextPanel.tsx";
import { getClusterLevel } from "../components/Map/Clusters/clusterLevel.ts";
import { useMapStore } from "../map/mapStore.ts";
import { useMapView } from "../map/view/hooks.ts";
import { CLUSTER_ROUTE_PATH } from "./routePath.ts";
import { useClearViewedCluster } from "./useClearViewedCluster.ts";
import { useViewedCluster } from "./useViewedCluster.ts";

const route = getRouteApi(CLUSTER_ROUTE_PATH);

export const ClusterPanel = () => {
  const { id } = route.useParams();
  const source = useLocation({ select: (location) => location.state.source });
  const view = useMapView();
  const cluster = useViewedCluster();
  const clearViewedCluster = useClearViewedCluster();
  const [thresholds, focusZoom] = useMapStore(
    useShallow((state) => [
      state.clusterLevelArticleThreshold,
      state.clusterFocusZoom,
    ]),
  );
  const position = cluster?.position;
  const articlesCount = cluster?.articlesCount;
  // Fit only when position changes; ignore other dep changes. On a route
  // transition source can flip before position clears, so without the gate
  // the effect would refit to the cluster the route is leaving.
  const fittedFor = useRef<typeof position>(undefined);

  useEffect(() => {
    if (!position || articlesCount === undefined) return;
    if (fittedFor.current === position) return;
    fittedFor.current = position;
    if (source === "map") return;
    const level = getClusterLevel(articlesCount, thresholds);
    view.centerOn(position, { scale: focusZoom[level] });
  }, [position, articlesCount, source, view, thresholds, focusZoom]);

  const externalId = cluster?.externalId;
  const header =
    externalId !== undefined ? (
      <Trans
        i18nKey={cluster?.name ? "article.info" : "article.infoUnnamed"}
        values={{ id: externalId, name: cluster?.name }}
        components={{ bold: <strong /> }}
      />
    ) : undefined;

  return (
    <ContextPanel
      header={header}
      onClose={() => {
        void clearViewedCluster();
      }}
    >
      <IframeArticle id={id} />
    </ContextPanel>
  );
};
