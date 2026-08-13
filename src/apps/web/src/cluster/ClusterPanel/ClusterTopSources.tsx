import { useTranslation } from "react-i18next";
import type { ViewedCluster } from "../useViewedCluster.ts";
import { LabelledList } from "./LabelledList.tsx";
import { PanelSection } from "./PanelSection.tsx";

export const ClusterTopSources = ({ cluster }: { cluster: ViewedCluster }) => {
  const { t } = useTranslation();
  const groups = [
    {
      label: t("map.clusterDetails.keyJournalsLabel"),
      entries: cluster.topJournals,
    },
    {
      label: t("map.clusterDetails.keyInstitutionsLabel"),
      entries: cluster.topInstitutions,
    },
    {
      label: t("map.clusterDetails.keyCompaniesLabel"),
      entries: cluster.topCompanies,
    },
  ];

  if (groups.every(({ entries }) => entries.length === 0)) return null;

  return (
    <PanelSection>
      {groups.map(({ label, entries }) => (
        <LabelledList
          key={label}
          label={label}
          items={entries.map((entry) => ({ key: entry, content: entry }))}
        />
      ))}
    </PanelSection>
  );
};
