import type {
  ClusterAttributesReader,
  ClusterMatch,
} from "../clusters/clusters.js";
import { DEFAULT_SORT, type SortValue } from "./sort.js";

/* Converts text into an embedding vector. */
export type EmbedQuery = (text: string) => Promise<number[]>;

const DEFAULT_LIMIT = 50;
const DEFAULT_MIN_SCORE = 0.65;

const reRank = (matches: ClusterMatch[], sort: SortValue): ClusterMatch[] => {
  if (sort.kind === "relevance") return matches;
  const sign = sort.direction === "asc" ? 1 : -1;
  return [...matches].sort(
    (a, b) => sign * (a.articlesCount - b.articlesCount),
  );
};

/* Creates the search service from its dependencies. */
export const createSearch = (deps: {
  clusters: Pick<ClusterAttributesReader, "findByVector">;
  embedQuery: EmbedQuery;
}) => ({
  /* Finds clusters most similar to the given text. */
  async query(args: {
    text: string;
    limit?: number;
    minScore?: number;
    sort?: SortValue;
  }): Promise<ClusterMatch[]> {
    const vector = await deps.embedQuery(args.text);
    const matches = await deps.clusters.findByVector({
      vector,
      limit: args.limit ?? DEFAULT_LIMIT,
      minScore: args.minScore ?? DEFAULT_MIN_SCORE,
    });
    return reRank(matches, args.sort ?? DEFAULT_SORT);
  },
});

/* Search service for finding clusters by text. */
export type Search = ReturnType<typeof createSearch>;
