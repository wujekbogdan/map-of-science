import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// TODO: Remove this when the i18n is fully implemented
export const i18n = (str: string) => str;

i18next
  .use(
    new LanguageDetector(null, {
      order: ["navigator", "localStorage"],
    }),
  )
  .use(initReactI18next)
  .init({
    supportedLngs: ["pl", "en", "pl-PL", "en-US"],
    fallbackLng: "pl-PL",
    load: "languageOnly",
    resources: {},
    interpolation: {
      escapeValue: false,
    },
  })
  .catch((err) => {
    console.error("Failed to initialize i18next:", err);
  });

export default i18next;
