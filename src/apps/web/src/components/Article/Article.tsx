import { useTranslation } from "react-i18next";
import { useArticleStore } from "../../article/articleStore.ts";
import { ArticleForArea } from "./ArticleForArea.tsx";
import { ArticleModal } from "./ArticleModal.tsx";
import HtmlArticle from "./HtmlArticle.tsx";

const Error = () => {
  const { t } = useTranslation();
  return <p>{t("general.error")}</p>;
};

export const Article = () => {
  const { type, article, areaId, reset } = useArticleStore();

  if (!type) {
    return null;
  }

  const Component = () => {
    switch (type) {
      case "local":
        return !article ? <Error /> : <HtmlArticle html={article} />;
      case "local-with-videos":
        return <ArticleForArea html={article} areaId={areaId} />;
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
