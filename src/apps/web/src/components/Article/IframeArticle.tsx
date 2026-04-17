import { useQuery } from "@tanstack/react-query";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { useTRPC } from "../../api-client/index.ts";

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
        <p>
          <Trans
            i18nKey="article.info"
            values={{ id: externalId, name: cluster.displayName }}
            components={{ bold: <strong /> }}
          />
        </p>
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

const Iframe = styled.iframe`
  width: 100%;
  flex-grow: 1;
  border: none;
`;
