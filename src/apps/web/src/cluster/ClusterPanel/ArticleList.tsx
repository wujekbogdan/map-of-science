import { useTranslation } from "react-i18next";
import styled from "styled-components";
import type { ViewedCluster } from "../useViewedCluster.ts";
import { LabelledList } from "./LabelledList.tsx";

type Props = {
  label: string;
  articles: ViewedCluster["articles"]["core"];
};

// Some ETO titles carry their own closing punctuation, so a second period would read "Title..".
const carriesOwnPunctuation = (title: string) => /[.?!:]$/.test(title);

export const ArticleList = ({ label, articles }: Props) => {
  const { t } = useTranslation();

  return (
    <LabelledList
      label={label}
      items={articles.map((article) => ({
        key: article.title,
        content: (
          <>
            {article.doi === null ? (
              article.title
            ) : (
              <Title
                href={`https://doi.org/${article.doi}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {article.title}
              </Title>
            )}
            {`${carriesOwnPunctuation(article.title) ? "" : "."} ${article.metadata}. ${t(
              "map.clusterDetails.articleCitations",
              { count: article.citations },
            )}.`}
          </>
        ),
      }))}
    />
  );
};

const Title = styled.a`
  color: inherit;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`;
