import { useTranslation } from "react-i18next";
import type { MapCluster } from "./Clusters.tsx";

export const ClusterDetails = ({ cluster }: { cluster: MapCluster }) => {
  const { t } = useTranslation();
  const id = `#${cluster.externalId.toString()}`;

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "6px",
        background: "white",
      }}
    >
      <p>
        <strong>{cluster.displayName}</strong> {id}
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

      {cluster.keyConcepts.length > 0 && (
        <>
          <strong>{t("map.clusterDetails.keywordsLabel")}:</strong>
          <ul>
            {cluster.keyConcepts.map((concept) => (
              <li key={concept}>{concept}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
