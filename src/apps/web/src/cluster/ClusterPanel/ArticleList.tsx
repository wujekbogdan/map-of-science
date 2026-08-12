import { useTranslation } from "react-i18next";
import type { ViewedCluster } from "../useViewedCluster.ts";

type Props = {
  title: string;
  articles: ViewedCluster["articles"]["core"];
};

// Some ETO titles carry their own closing punctuation, so a second period would read "Title..".
const carriesOwnPunctuation = (title: string) => /[.?!:]$/.test(title);

export const ArticleList = ({ title, articles }: Props) => {
  const { t } = useTranslation();

  if (articles.length === 0) return null;

  return (
    <section>
      <h4>{title}</h4>
      <ul>
        {articles.map((article) => (
          <li key={article.title}>
            {article.doi === null ? (
              article.title
            ) : (
              <a
                href={`https://doi.org/${article.doi}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {article.title}
              </a>
            )}
            {`${carriesOwnPunctuation(article.title) ? "" : "."} ${article.metadata}. ${t(
              "map.clusterDetails.articleCitations",
              { count: article.citations },
            )}.`}
          </li>
        ))}
      </ul>
    </section>
  );
};
