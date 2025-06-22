import { useTranslation } from "react-i18next";

const supportedLanguages = ["en-US", "pl-PL"] as const;
export type Lang = (typeof supportedLanguages)[number];

const isValidLanguage = (lang: unknown): lang is Lang => {
  return supportedLanguages.includes(lang as Lang);
};

export const useLanguage = () => {
  const { i18n } = useTranslation();
  return isValidLanguage(i18n.language) ? i18n.language : "en-US";
};
