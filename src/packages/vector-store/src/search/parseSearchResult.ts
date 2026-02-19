import { searchResultSchema } from "./types.js";

export const parseSearchResult = (item: unknown) => {
  const parsed = searchResultSchema.parse(item);
  return { id: parsed.id, score: parsed.score, metadata: parsed.payload };
};
