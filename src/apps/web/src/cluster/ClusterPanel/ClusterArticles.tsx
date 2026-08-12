import { useTranslation } from "react-i18next";
import type { ViewedCluster } from "../useViewedCluster.ts";
import { ArticleList } from "./ArticleList.tsx";

export const ClusterArticles = ({ cluster }: { cluster: ViewedCluster }) => {
  const { t } = useTranslation();
  const { core, review, highlyCited } = cluster.articles;

  if (core.length + review.length + highlyCited.length === 0) return null;

  return (
    <section>
      <h3>{t("map.clusterDetails.keyRecentArticles")}</h3>
      <ArticleList
        title={t("map.clusterDetails.coreArticles")}
        articles={core}
      />
      <ArticleList
        title={t("map.clusterDetails.reviewArticles")}
        articles={review}
      />
      <ArticleList
        title={t("map.clusterDetails.highlyCitedArticles")}
        articles={highlyCited}
      />
    </section>
  );
};
