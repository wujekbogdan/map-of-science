import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { translations } from "./translations.ts";

i18next
  .use(
    new LanguageDetector(null, {
      order: ["navigator", "localStorage"],
    }),
  )
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translations.en },
      pl: { translation: translations.pl },
    },
    supportedLngs: ["pl", "en"],
    fallbackLng: "en",
    load: "languageOnly",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      caches: ["localStorage"],
      order: ["localStorage", "navigator"],
    },
    react: {
      useSuspense: false,
    },
  })
  .catch((err) => {
    console.error("Failed to initialize i18next:", err);
  });

export default i18next;
