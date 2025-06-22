import { useTranslation } from "react-i18next";

const supportedLanguages = ["en-US", "pl-PL"] as const;
export type LangCode = (typeof supportedLanguages)[number];
export type LangShort = LangCode extends `${infer Short}-${string}`
  ? Short
  : never;

const isValidLanguage = (lang: unknown): lang is LangCode => {
  return supportedLanguages.includes(lang as LangCode);
};

const shorten = (lang: LangCode) => {
  return lang.split("-")[0] as LangShort;
};

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const language = isValidLanguage(i18n.language) ? i18n.language : "en-US";

  return {
    code: language,
    short: shorten(language),
    supportedLanguages: supportedLanguages.map((code) => ({
      code,
      short: shorten(code),
    })),
  };
};
