import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import { useStore } from "../../store.ts";

export const IframeArticle = ({ id }: { id: number }) => {
  const { t } = useTranslation("article");
  const clusters = useStore((state) => state.clusters);
  const clusterName = clusters.get(id)?.name;
  const url = `https://sciencemap.eto.tech/cluster/?version=2&cluster_id=${id.toString()}`;
  return (
    <Wrapper>
      <p>
        <Trans
          i18nKey="article.info"
          values={{ id, name: clusterName }}
          components={{ bold: <strong /> }}
        />
      </p>
      <Iframe src={url} />
      <p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {t("article.openInNewTab")} »
        </a>
      </p>
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
