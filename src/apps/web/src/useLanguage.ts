import { useTranslation } from "react-i18next";

const supportedLanguages = ["en", "pl"] as const;
export type LangCode = (typeof supportedLanguages)[number];

const isValidLanguage = (lang: unknown): lang is LangCode =>
  lang === "en" || lang === "pl";

export const toLangCode = (raw: string): LangCode => {
  const short = raw.split("-")[0];
  return isValidLanguage(short) ? short : "en";
};

export const useLanguage = () => {
  const { i18n } = useTranslation();

  return {
    language: toLangCode(i18n.language),
    supportedLanguages,
  };
};
