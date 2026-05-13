import { getRouteApi, useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { IframeArticle } from "../components/Article/IframeArticle.tsx";
import { useMapView } from "../map/view/hooks.ts";
import { CLUSTER_ROUTE_PATH } from "./routePath.ts";
import { useActiveCluster } from "./useActiveCluster.ts";

const route = getRouteApi(CLUSTER_ROUTE_PATH);

export const ClusterPanel = () => {
  const { id } = route.useParams();
  const source = useLocation({ select: (location) => location.state.source });
  const view = useMapView();
  const cluster = useActiveCluster();
  const position = cluster?.position;
  // Fit only when position changes; ignore other dep changes. On a route
  // transition source can flip before position clears, so without the gate
  // the effect would refit to the cluster the route is leaving.
  const fittedFor = useRef<typeof position>(undefined);

  useEffect(() => {
    if (!position) return;
    if (fittedFor.current === position) return;
    fittedFor.current = position;
    if (source === "map") return;
    view.fitToPoints([position]);
  }, [position, source, view]);

  return <IframeArticle id={id} />;
};
