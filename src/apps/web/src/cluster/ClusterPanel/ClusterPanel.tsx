import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import styled from "styled-components";
import { useShallow } from "zustand/react/shallow";
import { ContextPanel } from "../../components/ContextPanel/ContextPanel.tsx";
import { getClusterLevel } from "../../components/Map/Clusters/clusterLevel.ts";
import { useMapStore } from "../../map/mapStore.ts";
import { useMapView } from "../../map/view/hooks.ts";
import { rhythm } from "../../typography.ts";
import { useClearViewedCluster } from "../useClearViewedCluster.ts";
import { useViewedCluster } from "../useViewedCluster.ts";
import { ClusterArticles } from "./ClusterArticles.tsx";
import { ClusterFacts } from "./ClusterFacts.tsx";
import { ClusterTopSources } from "./ClusterTopSources.tsx";
import { RatingLegend } from "./RatingLegend.tsx";
import { RelatedClusters } from "./RelatedClusters.tsx";

export const ClusterPanel = () => {
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

  // The placeholder name already carries the id, so only a named cluster needs it added.
  const header = cluster
    ? cluster.name
      ? `${cluster.displayName} (#${cluster.externalId.toString()})`
      : cluster.displayName
    : undefined;

  return (
    <ContextPanel
      header={header}
      onClose={() => {
        void clearViewedCluster();
      }}
    >
      {cluster && (
        <Body>
          <ClusterFacts cluster={cluster} />
          <ClusterArticles cluster={cluster} />
          <ClusterTopSources cluster={cluster} />
          <RelatedClusters cluster={cluster} />
          <RatingLegend />
        </Body>
      )}
    </ContextPanel>
  );
};

const Body = styled.div`
  flex: 1;
  min-height: 0;
  /* Outside the scroll box, so the gap under the header survives scrolling. */
  margin-top: ${rhythm.space.aboveBody};
  overflow-y: auto;
`;
