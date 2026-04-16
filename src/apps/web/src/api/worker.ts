import { Lang } from "./i18n.ts";

export const loadData = () => {
  const worker = new ComlinkWorker<typeof import("./data.ts")>(
    new URL("./data.ts", import.meta.url),
  );

  return worker.loadData();
};

export const loadI18n = (lang: Lang) => {
  const worker = new ComlinkWorker<typeof import("./i18n.ts")>(
    new URL("./i18n.ts", import.meta.url),
  );

  return worker.loadI18n(lang);
};
