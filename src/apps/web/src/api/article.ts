import { Lang } from "./i18n.ts";

const articles: Record<string, () => Promise<{ default: string }>> =
  Object.entries(import.meta.glob("../articles/*.md")).reduce(
    (acc, [path, importFn]) => {
      return {
        ...acc,
        [path.replace("../articles/", "").replace(".md", "")]: importFn,
      };
    },
    {},
  );

const localizedLabelId = (label: string, lang: Lang) => {
  const prefix = label.toLowerCase().replace(/[^a-z0-9]/g, "_"); // Replace non-alphanumeric characters with underscores
  const suffix = (
    {
      en: "en-US",
      pl: "pl-PL",
    } as const
  )[lang];

  return `${prefix}-${suffix}`;
};

export const isArticleAvailable = (localizedId: string) => {
  return localizedId in articles;
};

const markdownToHtml = async (markdown: string) => {
  const { marked } = await import("marked");

  return marked.parse(markdown);
};

export const fetchArticle = async (label: string, lang: Lang) => {
  const localizedId = localizedLabelId(label, lang);
  console.log(localizedId);

  if (!isArticleAvailable(localizedId)) {
    return null;
  }

  const path = (await articles[localizedId]()).default;

  if (!path) {
    throw new Error(`Article not found: ${localizedId}`);
  }

  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch article: labelId:${localizedId}, response: ${response.statusText}`,
    );
  }

  return await markdownToHtml(await response.text());
};
