import { useTranslation } from "react-i18next";
import { useArticleStore } from "../../store.ts";
import { ArticleModal } from "./ArticleModal.tsx";
import { ArticleWithVideos } from "./ArticleWithVideos.tsx";
import HtmlArticle from "./HtmlArticle.tsx";
import { IframeArticle } from "./IframeArticle.tsx";

const Error = () => {
  const { t } = useTranslation();
  return <p>{t("general.error")}</p>;
};

export const Article = () => {
  const { type, id, article, videos, reset } = useArticleStore();

  if (!type) {
    return null;
  }

  const Component = () => {
    switch (type) {
      case "iframe":
        return <IframeArticle id={id} />;
      case "local-with-videos":
        return <ArticleWithVideos html={article} videos={videos} />;
      case "local":
        return !article ? <Error /> : <HtmlArticle html={article} />;
    }
  };

  return (
    <ArticleModal
      onClose={() => {
        reset();
      }}
    >
      {Component()}
    </ArticleModal>
  );
};
