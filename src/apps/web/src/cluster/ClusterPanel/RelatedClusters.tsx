import { useTranslation } from "react-i18next";
import { useNavigateToCluster } from "../useNavigateToCluster.ts";
import type { ViewedCluster } from "../useViewedCluster.ts";

const SHOWN_COUNT = 5;

export const RelatedClusters = ({ cluster }: { cluster: ViewedCluster }) => {
  const { t } = useTranslation();
  const navigateToCluster = useNavigateToCluster();
  const shown = cluster.rankedRelatedClusters.slice(0, SHOWN_COUNT);

  if (shown.length === 0) return null;

  return (
    <section>
      <h3>{t("map.clusterDetails.relatedClusters")}</h3>
      <ul>
        {shown.map(({ externalId, displayName, id }) => (
          <li key={externalId}>
            {id === null ? (
              displayName
            ) : (
              <button
                type="button"
                onClick={() => {
                  void navigateToCluster(id);
                }}
              >
                {displayName}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
