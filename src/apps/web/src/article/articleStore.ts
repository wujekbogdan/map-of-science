import { create } from "zustand";
import { fetchArticle } from "../api";
import { type LangCode } from "../useLanguage.ts";

type ArticleState =
  | { id: null; type: null; article: null; areaId: null }
  | { id: null; type: "local"; article: string | null; areaId: null }
  | {
      id: null;
      type: "local-with-videos";
      article: string | null;
      areaId: string;
    }
  | { id: string; type: "iframe"; article: null; areaId: null };

type ArticleActions = {
  reset: () => void;
  setRemoteArticleId: (id: string) => void;
  fetchAreaArticle: (
    areaId: string,
    label: string,
    lang: LangCode,
  ) => Promise<void>;
  fetchGeneralInfo: (lang: LangCode) => Promise<void>;
};

export const useArticleStore = create<ArticleState & ArticleActions>((set) => ({
  id: null,
  type: null,
  article: null,
  areaId: null,
  reset: () => {
    set({ id: null, type: null, article: null, areaId: null });
  },
  setRemoteArticleId: (id: string) => {
    set({ id, type: "iframe", article: null, areaId: null });
  },
  fetchAreaArticle: async (areaId: string, label: string, lang: LangCode) => {
    const articleHTML = await fetchArticle(label, lang);
    set({
      id: null,
      type: "local-with-videos",
      article: articleHTML,
      areaId,
    });
  },
  fetchGeneralInfo: async (lang: LangCode) => {
    const articleHTML = await fetchArticle("general-info", lang);
    set({ id: null, type: "local", article: articleHTML, areaId: null });
  },
}));
