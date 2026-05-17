import { useQuery } from "@tanstack/react-query";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { useTRPC } from "../../api-client/index.ts";
import { CLOSE_BUTTON_SIZE_PX } from "../ContextPanel/ContextPanel.tsx";

const HEADING_CLOSE_GAP_PX = 8;

// TODO: render a loading state while the cluster is being fetched. The modal
// opens blank for a beat because rendering waits on a tRPC round-trip.
export const IframeArticle = ({ id }: { id: string }) => {
  const { t } = useTranslation("article");
  const trpc = useTRPC();
  const { data: cluster } = useQuery(trpc.cluster.byId.queryOptions({ id }));
  const externalId = cluster?.externalId;
  const url = externalId
    ? `https://sciencemap.eto.tech/cluster/?version=2&cluster_id=${externalId.toString()}`
    : null;
  return (
    <Wrapper>
      {cluster && externalId !== undefined && (
        <Heading>
          <Trans
            i18nKey={cluster.name ? "article.info" : "article.infoUnnamed"}
            values={{ id: externalId, name: cluster.name }}
            components={{ bold: <strong /> }}
          />
        </Heading>
      )}
      {url && <Iframe src={url} />}
      {url && (
        <p>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {t("article.openInNewTab")} »
          </a>
        </p>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Heading = styled.h2`
  margin-top: 0;
  /* Clear the context panel's close control (its --chrome-offset inset plus
     the button itself) and add a gap so the title doesn't crowd it. */
  padding-right: calc(
    var(--chrome-offset) + ${CLOSE_BUTTON_SIZE_PX}px + ${HEADING_CLOSE_GAP_PX}px
  );
  font-size: 1em;
  font-weight: normal;
  line-height: 1.5;
`;

const Iframe = styled.iframe`
  width: 100%;
  flex-grow: 1;
  border: none;
`;
