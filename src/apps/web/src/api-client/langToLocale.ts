import type { LangCode } from "../useLanguage.ts";

const mapping = {
  en: "en-US",
  pl: "pl-PL",
} as const;

export const langToLocale = (lang: LangCode) => mapping[lang];
