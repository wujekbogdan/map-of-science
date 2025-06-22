import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { backend } from "./backend";

i18next
  .use(
    new LanguageDetector(null, {
      order: ["navigator", "localStorage"],
    }),
  )
  .use(initReactI18next)
  .use(backend)
  .init({
    supportedLngs: ["pl", "en"],
    load: "languageOnly",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      caches: ["localStorage"],
      order: ["localStorage", "navigator"],
    },
  })
  .catch((err) => {
    console.error("Failed to initialize i18next:", err);
  });

export default i18next;
