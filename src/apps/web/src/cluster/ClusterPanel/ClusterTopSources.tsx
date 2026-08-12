import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import type { ViewedCluster } from "../useViewedCluster.ts";

export const ClusterTopSources = ({ cluster }: { cluster: ViewedCluster }) => {
  const { t } = useTranslation();
  const rows = [
    {
      labelKey: "map.clusterDetails.keyJournalsLabel",
      entries: cluster.topJournals,
    },
    {
      labelKey: "map.clusterDetails.keyInstitutionsLabel",
      entries: cluster.topInstitutions,
    },
    {
      labelKey: "map.clusterDetails.keyCompaniesLabel",
      entries: cluster.topCompanies,
    },
  ];

  return (
    <dl>
      {rows
        .filter(({ entries }) => entries.length > 0)
        .map(({ labelKey, entries }) => (
          <Fragment key={labelKey}>
            <dt>{t(labelKey)}</dt>
            <dd>{entries.join(", ")}</dd>
          </Fragment>
        ))}
    </dl>
  );
};
