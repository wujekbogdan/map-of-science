import { useTranslation } from "react-i18next";
import { Concept, Cluster } from "../../../api/model";

export const ClusterDetails = (props: {
  cluster: Cluster;
  concepts: Map<number, Concept>;
}) => {
  const { t } = useTranslation();
  const { cluster, concepts } = props;

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "6px",
        background: "white",
      }}
    >
      <strong>{cluster.clusterId.toString()}</strong>
      <br />

      <span
        className={
          cluster.articlesCount <= 100
            ? "few-articles"
            : cluster.articlesCount >= 1000
              ? "many-articles"
              : undefined
        }
      >
        {t("map.clusterDetails.articleCount", {
          count: cluster.articlesCount,
        })}
      </span>
      <br />

      <span
        className={cluster.growthRating >= 80 ? "many-articles" : undefined}
      >
        {t("map.clusterDetails.growthRating", {
          rating: cluster.growthRating,
        })}
      </span>
      <br />
      <br />

      <strong>{t("map.clusterDetails.keywordsLabel")}:</strong>
      <ul>
        {cluster.keyConcepts.map((conceptId) => {
          const concept = concepts.get(Number(conceptId));
          return <li key={conceptId}>{concept?.key}</li>;
        })}
      </ul>
    </div>
  );
};
