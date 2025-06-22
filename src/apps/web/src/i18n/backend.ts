import { BackendModule } from "i18next";
import { loadI18n } from "../api/worker.ts";

export const backend: BackendModule = {
  type: "backend",
  init: () => undefined,
  read: (language, namespace, callback) => {
    const lang =
      (
        {
          en: "en-US",
          pl: "pl-PL",
        } as const
      )[language] ?? "pl-PL";

    loadI18n(lang)
      .then((i18n) => {
        callback(null, i18n);
      })
      .catch((err) => {
        const msg = `Failed to load i18n for ${language} (${namespace})`;
        console.error(msg, err);
        callback(msg, null);
      });
  },
};
