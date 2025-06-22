import { z } from "zod";
import { i18nSchema } from "./model";
import { loadAsArray } from "./utils.ts";

export type Lang = "en" | "pl";

export const loadI18n = async (lang: Lang) => {
  const i18nUrl = {
    en: new URL("../../asset/ui_i18n_en-US.tsv", import.meta.url).href,
    pl: new URL("../../asset/ui_i18n_pl-PL.tsv", import.meta.url).href,
  }[lang];

  const i18n = await loadAsArray({
    url: i18nUrl,
    schema: i18nSchema(z),
  });

  return {
    i18n: Object.fromEntries(
      i18n.map(({ id, translation }) => [id, translation]),
    ),
  };
};
