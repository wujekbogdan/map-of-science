import { useTranslation } from "react-i18next";
import { Concept, DataPoint } from "../../../api/model";

export const DataPointDetails = (props: {
  point: DataPoint;
  concepts: Map<number, Concept>;
}) => {
  const { t } = useTranslation();
  const { point, concepts } = props;

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "6px",
        background: "white",
      }}
    >
      <strong>{point.clusterId.toString()}</strong>
      <br />

      <span
        className={
          point.numRecentArticles <= 100
            ? "few-articles"
            : point.numRecentArticles >= 1000
              ? "many-articles"
              : undefined
        }
      >
        {t("map.clusterDetails.articleCount", {
          count: point.numRecentArticles,
        })}
      </span>
      <br />

      <span className={point.growthRating >= 80 ? "many-articles" : undefined}>
        {t("map.clusterDetails.growthRating", {
          rating: point.growthRating,
        })}
      </span>
      <br />
      <br />

      <strong>{t("map.clusterDetails.keywordsLabel")}:</strong>
      <ul>
        {point.keyConcepts.map((conceptId) => {
          const concept = concepts.get(Number(conceptId));
          return <li key={conceptId}>{concept?.key}</li>;
        })}
      </ul>
    </div>
  );
};
