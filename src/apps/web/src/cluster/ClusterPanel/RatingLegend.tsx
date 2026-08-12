import { Fragment } from "react";
import { useTranslation } from "react-i18next";

const RATING_BANDS = [
  { labelKey: "map.clusterDetails.rating.veryLow", range: "0-20" },
  { labelKey: "map.clusterDetails.rating.low", range: "20-40" },
  { labelKey: "map.clusterDetails.rating.average", range: "40-60" },
  { labelKey: "map.clusterDetails.rating.high", range: "60-80" },
  { labelKey: "map.clusterDetails.rating.veryHigh", range: "80-95" },
  { labelKey: "map.clusterDetails.rating.extremelyHigh", range: "95-100" },
] as const;

export const RatingLegend = () => {
  const { t } = useTranslation();

  return (
    <section>
      <h3>{t("map.clusterDetails.ratingScale")}</h3>
      <dl>
        {RATING_BANDS.map(({ labelKey, range }) => (
          <Fragment key={labelKey}>
            <dt>{t(labelKey)}</dt>
            <dd>{range}</dd>
          </Fragment>
        ))}
      </dl>
    </section>
  );
};
