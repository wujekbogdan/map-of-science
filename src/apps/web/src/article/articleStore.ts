import { create } from "zustand";
import { fetchArticle } from "../api";
import { Lang } from "../api/i18n.ts";
import { YoutubeVideo } from "../api/model";

type ArticleState =
  | { id: null; type: null; article: null; videos: YoutubeVideo[] }
  | {
      id: null;
      type: "local-with-videos";
      article: string | null;
      videos: YoutubeVideo[];
    }
  | { id: null; type: "local"; article: string | null; videos: null }
  | { id: number; type: "iframe"; article: null; videos: YoutubeVideo[] };

type ArticleActions = {
  reset: () => void;
  setRemoteArticleId: (id: number) => void;
  fetchLocalArticle: (label: string, lang: Lang) => Promise<void>;
  fetchGeneralInfo: (lang: Lang) => Promise<void>;
  setVideos: (videos: YoutubeVideo[]) => void;
};

export const useArticleStore = create<ArticleState & ArticleActions>((set) => ({
  id: null,
  type: null,
  article: null,
  // TODO: Videos and local articles should not be handled separately.
  // Fetch logic should be encapsulated in the store, so that videos and articles can be fetched together rather
  // than set from the outside.
  videos: [],
  reset: () => {
    set({ id: null, type: null, article: null, videos: [] });
  },
  setRemoteArticleId: (id: number) => {
    set({ id, type: "iframe", article: null });
  },
  fetchLocalArticle: async (label: string, lang: Lang) => {
    const articleHTML = await fetchArticle(label, lang);
    set({ id: null, type: "local-with-videos", article: articleHTML });
  },
  fetchGeneralInfo: async (lang: Lang) => {
    const articleHTML = await fetchArticle("general-info", lang);
    set({ id: null, type: "local", article: articleHTML });
  },
  setVideos: (videos: YoutubeVideo[]) => {
    set({ videos, id: null, type: "local-with-videos" });
  },
}));
