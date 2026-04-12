import { z } from "zod";
import type { Search } from "@map-of-science/atlas";
import type { AtlasStore } from "@map-of-science/atlas-store";

const langSchema = z
  .string()
  .transform((value) => value.replace("-", "_"))
  .pipe(z.enum(["en_US", "pl_PL"]));

export type Lang = z.infer<typeof langSchema>;

const DEFAULT_LANG: Lang = "en_US";

const parseAcceptLanguage = (value: string | undefined): Lang =>
  value === undefined ? DEFAULT_LANG : langSchema.parse(value);

type CreateInnerContextOptions = {
  lang?: Lang;
  atlas: AtlasStore;
  search: Search;
};

export const createInnerContext = (opts: CreateInnerContextOptions) => ({
  lang: opts.lang ?? DEFAULT_LANG,
  atlas: opts.atlas,
  search: opts.search,
});

export type Context = ReturnType<typeof createInnerContext>;

export type HttpRequest = {
  headers: {
    "accept-language"?: string;
  };
};

type CreateContextOptions = {
  req: HttpRequest;
  atlas: AtlasStore;
  search: Search;
};

export const createContext = ({ req, atlas, search }: CreateContextOptions) =>
  createInnerContext({
    lang: parseAcceptLanguage(req.headers["accept-language"]),
    atlas,
    search,
  });
