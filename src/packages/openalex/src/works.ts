import { chunk } from "es-toolkit";
import { z } from "zod";
import { invertedIndexToText } from "./invertedIndexToText.js";

const BASE_URL = "https://api.openalex.org";
const BATCH_SIZE = 100;
const SELECT_FIELDS = ["id", "doi", "title", "abstract_inverted_index"].join(
  ",",
);

// https://docs.openalex.org/api-entities/works/work-object
const apiWorkSchema = z.object({
  id: z.string(),
  doi: z.string(),
  title: z.string(),
  abstract_inverted_index: z.record(z.string(), z.array(z.number())).nullable(),
});

const apiResponseSchema = z.object({
  results: z.array(apiWorkSchema),
});

const parseWork = (work: z.infer<typeof apiWorkSchema>) => ({
  id: work.id,
  doi: work.doi,
  title: work.title,
  abstract: work.abstract_inverted_index
    ? invertedIndexToText(work.abstract_inverted_index)
    : null,
});

export type Work = ReturnType<typeof parseWork>;

type Config = {
  apiKey: string;
  email: string;
};

const assertResponseOk = (response: Response) => {
  if (response.ok) return;
  if (response.status === 401) {
    throw new Error("OpenAlex: invalid API key");
  }
  if (response.status === 429) {
    throw new Error("OpenAlex: rate limit exceeded");
  }
  throw new Error(`OpenAlex: request failed with status ${response.status}`);
};

export const createFetchWorks = (config: Config) => {
  const buildUrl = (dois: string[]) => {
    const url = new URL("/works", BASE_URL);
    url.searchParams.set("api_key", config.apiKey);
    url.searchParams.set("mailto", config.email);
    url.searchParams.set("select", SELECT_FIELDS);
    url.searchParams.set("filter", `doi:${dois.join("|")}`);
    url.searchParams.set("per-page", String(BATCH_SIZE));
    return url.toString();
  };

  const fetchBatch = async (dois: string[]) => {
    const response = await fetch(buildUrl(dois));
    assertResponseOk(response);
    const data = apiResponseSchema.parse(await response.json());
    return data.results.map(parseWork);
  };

  return async (dois: string[]) => {
    if (dois.length === 0) return [];
    const batches = await Promise.all(chunk(dois, BATCH_SIZE).map(fetchBatch));
    return batches.flat();
  };
};
