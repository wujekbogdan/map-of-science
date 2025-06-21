import { Lang } from "./data.ts";

export const loadData = (lang: Lang) => {
  const worker = new ComlinkWorker<typeof import("./data.ts")>(
    new URL("./data.ts", import.meta.url),
  );

  return worker.loadData(lang);
};
