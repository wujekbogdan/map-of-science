import { useTranslation } from "react-i18next";

const supportedLanguages = ["en", "pl"] as const;
export type LangCode = (typeof supportedLanguages)[number];

const shorten = (lang: LangCode) => {
  return lang.split("-")[0] as LangCode;
};

const isValidLanguage = (lang: unknown): lang is LangCode => {
  return supportedLanguages.includes(lang as LangCode);
};

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const language = isValidLanguage(i18n.language) ? i18n.language : "en";

  return {
    language: shorten(language),
    supportedLanguages: supportedLanguages,
  };
};
