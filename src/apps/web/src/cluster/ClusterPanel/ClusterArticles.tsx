import { useTranslation } from "react-i18next";
import type { ViewedCluster } from "../useViewedCluster.ts";
import { ArticleList } from "./ArticleList.tsx";
import { PanelSection } from "./PanelSection.tsx";

export const ClusterArticles = ({ cluster }: { cluster: ViewedCluster }) => {
  const { t } = useTranslation();
  const { core, review, highlyCited } = cluster.articles;

  if (core.length + review.length + highlyCited.length === 0) return null;

  return (
    <PanelSection title={t("map.clusterDetails.keyRecentArticles")}>
      <ArticleList
        label={t("map.clusterDetails.coreArticles")}
        articles={core}
      />
      <ArticleList
        label={t("map.clusterDetails.reviewArticles")}
        articles={review}
      />
      <ArticleList
        label={t("map.clusterDetails.highlyCitedArticles")}
        articles={highlyCited}
      />
    </PanelSection>
  );
};
