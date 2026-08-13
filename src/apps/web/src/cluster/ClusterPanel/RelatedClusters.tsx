import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useNavigateToCluster } from "../useNavigateToCluster.ts";
import type { ViewedCluster } from "../useViewedCluster.ts";
import { LabelledList } from "./LabelledList.tsx";
import { PanelSection } from "./PanelSection.tsx";

const SHOWN_COUNT = 5;

export const RelatedClusters = ({ cluster }: { cluster: ViewedCluster }) => {
  const { t } = useTranslation();
  const navigateToCluster = useNavigateToCluster();
  const shown = cluster.rankedRelatedClusters.slice(0, SHOWN_COUNT);

  if (shown.length === 0) return null;

  return (
    <PanelSection title={t("map.clusterDetails.relatedClusters")}>
      <LabelledList
        items={shown.map(({ externalId, displayName, id }) => ({
          key: externalId.toString(),
          content:
            id === null ? (
              displayName
            ) : (
              <Name
                type="button"
                onClick={() => {
                  void navigateToCluster(id);
                }}
              >
                {displayName}
              </Name>
            ),
        }))}
      />
    </PanelSection>
  );
};

// A stored cluster is navigable, so it reads as a link rather than a button.
const Name = styled.button`
  appearance: none;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  text-align: left;
  color: inherit;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`;
