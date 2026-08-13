import { useTranslation } from "react-i18next";
import { FactList } from "./FactList.tsx";
import { PanelSection } from "./PanelSection.tsx";

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
    <PanelSection title={t("map.clusterDetails.ratingScale")}>
      <FactList
        rows={RATING_BANDS.map(({ labelKey, range }) => ({
          label: t(labelKey),
          value: range,
        }))}
      />
    </PanelSection>
  );
};
