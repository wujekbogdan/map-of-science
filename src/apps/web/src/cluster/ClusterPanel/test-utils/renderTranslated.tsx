import { render } from "@testing-library/react";
import i18next from "i18next";
import type { ReactNode } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { translations } from "../../../i18n/translations.ts";
import type { LangCode } from "../../../useLanguage.ts";

/** Renders with the app's real translations, so a spec sees the words a user sees. */
export const renderTranslated = async (
  ui: ReactNode,
  language: LangCode = "en",
) => {
  const instance = i18next.createInstance();
  await instance.use(initReactI18next).init({
    lng: language,
    resources: {
      en: { translation: translations.en },
      pl: { translation: translations.pl },
    },
  });

  return render(<I18nextProvider i18n={instance}>{ui}</I18nextProvider>);
};
