import { useTranslation } from "react-i18next";
import { Concept, Cluster } from "../../../api/model";

export const ClusterDetails = (props: {
  cluster: Cluster;
  concepts: Map<number, Concept>;
}) => {
  const { t } = useTranslation();
  const { cluster, concepts } = props;
  // Prefer curated place name, fall back to LLM-generated name
  const name = cluster.place?.text ?? cluster.name ?? "";
  const id = `#${cluster.clusterId.toString()}`;

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "6px",
        background: "white",
      }}
    >
      <p>
        {name ? (
          <>
            <strong>{name}</strong> {id}
          </>
        ) : (
          <strong>{id}</strong>
        )}
      </p>

      <span>
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
