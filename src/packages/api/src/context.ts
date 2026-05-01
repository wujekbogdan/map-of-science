import { z } from "zod";
import type { Search } from "@map-of-science/atlas";
import type { AtlasStore } from "@map-of-science/atlas-store";

const langSchema = z.enum(["en_US", "pl_PL"]);

export type Lang = z.infer<typeof langSchema>;

const DEFAULT_LANG: Lang = "en_US";

// Lang comes in via `x-lang`. `Accept-Language` can't be used: it's a forbidden
// request header per the Fetch spec, so browser callers can't set it.
const LANG_HEADER = "x-lang";

const parseLangHeader = (value: string | string[] | undefined) =>
  langSchema.safeParse(Array.isArray(value) ? value[0] : value).data ??
  DEFAULT_LANG;

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
  headers: Record<string, string | string[] | undefined>;
};

type CreateContextOptions = {
  req: HttpRequest;
  atlas: AtlasStore;
  search: Search;
};

export const createContext = ({ req, atlas, search }: CreateContextOptions) =>
  createInnerContext({
    lang: parseLangHeader(req.headers[LANG_HEADER]),
    atlas,
    search,
  });
