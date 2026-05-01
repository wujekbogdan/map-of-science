import type { Lang } from "@map-of-science/api";
import type { LangCode } from "../useLanguage.ts";

const mapping: Record<LangCode, Lang> = {
  en: "en_US",
  pl: "pl_PL",
};

export const toBackendLang = (lang: LangCode): Lang => mapping[lang];
