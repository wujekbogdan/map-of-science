import { useTranslation } from "react-i18next";
import { useLanguage } from "../../useLanguage.ts";
import type { ViewedCluster } from "../useViewedCluster.ts";

export const ClusterFacts = ({ cluster }: { cluster: ViewedCluster }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const rating = new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const years = new Intl.NumberFormat(language, { maximumFractionDigits: 1 });

  return (
    <dl>
      <dt>{t("map.clusterDetails.keywordsLabel")}</dt>
      <dd>{cluster.keyConcepts.join(", ")}</dd>

      <dt>{t("map.clusterDetails.clusterSizeLabel")}</dt>
      <dd>
        {t("map.clusterDetails.clusterSizeValue", {
          count: cluster.articlesCount,
        })}
      </dd>

      <dt>{t("map.clusterDetails.averageArticleAgeLabel")}</dt>
      <dd>
        {t("map.clusterDetails.averageArticleAgeValue", {
          years: years.format(cluster.averageArticleAgeYears),
        })}
      </dd>

      <dt>{t("map.clusterDetails.growthRatingLabel")}</dt>
      <dd>{rating.format(cluster.growthRating)}</dd>

      <dt>{t("map.clusterDetails.citationRatingLabel")}</dt>
      <dd>{rating.format(cluster.citationRating)}</dd>

      <dt>{t("map.clusterDetails.patentRatingLabel")}</dt>
      <dd>{rating.format(cluster.patentRating)}</dd>
    </dl>
  );
};
