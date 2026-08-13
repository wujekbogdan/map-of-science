import { useTranslation } from "react-i18next";
import { useLanguage } from "../../useLanguage.ts";
import type { ViewedCluster } from "../useViewedCluster.ts";
import { FactList } from "./FactList.tsx";
import { PanelSection } from "./PanelSection.tsx";

export const ClusterFacts = ({ cluster }: { cluster: ViewedCluster }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const rating = new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const years = new Intl.NumberFormat(language, { maximumFractionDigits: 1 });

  return (
    <PanelSection>
      <FactList
        rows={[
          {
            label: t("map.clusterDetails.clusterSizeLabel"),
            value: t("map.clusterDetails.clusterSizeValue", {
              count: cluster.articlesCount,
            }),
          },
          {
            label: t("map.clusterDetails.averageArticleAgeLabel"),
            value: t("map.clusterDetails.averageArticleAgeValue", {
              years: years.format(cluster.averageArticleAgeYears),
            }),
          },
          {
            label: t("map.clusterDetails.growthRatingLabel"),
            value: rating.format(cluster.growthRating),
          },
          {
            label: t("map.clusterDetails.citationRatingLabel"),
            value: rating.format(cluster.citationRating),
          },
          {
            label: t("map.clusterDetails.patentRatingLabel"),
            value: rating.format(cluster.patentRating),
          },
          {
            label: t("map.clusterDetails.keywordsLabel"),
            value: cluster.keyConcepts.join(", "),
          },
        ]}
      />
    </PanelSection>
  );
};
