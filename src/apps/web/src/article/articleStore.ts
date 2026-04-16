import { create } from "zustand";
import { fetchArticle } from "../api";
import { Lang } from "../api/i18n.ts";

type ArticleState =
  | { id: null; type: null; article: null }
  | { id: null; type: "local"; article: string | null }
  | { id: string; type: "iframe"; article: null };

type ArticleActions = {
  reset: () => void;
  setRemoteArticleId: (id: string) => void;
  fetchLocalArticle: (label: string, lang: Lang) => Promise<void>;
  fetchGeneralInfo: (lang: Lang) => Promise<void>;
};

export const useArticleStore = create<ArticleState & ArticleActions>((set) => ({
  id: null,
  type: null,
  article: null,
  reset: () => {
    set({ id: null, type: null, article: null });
  },
  setRemoteArticleId: (id: string) => {
    set({ id, type: "iframe", article: null });
  },
  fetchLocalArticle: async (label: string, lang: Lang) => {
    const articleHTML = await fetchArticle(label, lang);
    set({ id: null, type: "local", article: articleHTML });
  },
  fetchGeneralInfo: async (lang: Lang) => {
    const articleHTML = await fetchArticle("general-info", lang);
    set({ id: null, type: "local", article: articleHTML });
  },
}));
