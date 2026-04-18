import type { ClusterMatch, ClusterRepository } from "../clusters/clusters.js";

/* Converts text into an embedding vector. */
export type EmbedQuery = (text: string) => Promise<number[]>;

const DEFAULT_LIMIT = 50;
const DEFAULT_MIN_SCORE = 0.65;

/* Creates the search service from its dependencies. */
export const createSearch = (deps: {
  clusters: Pick<ClusterRepository, "findByVector">;
  embedQuery: EmbedQuery;
}) => ({
  /* Finds clusters most similar to the given text. */
  async query(args: {
    text: string;
    limit?: number;
    minScore?: number;
  }): Promise<ClusterMatch[]> {
    const vector = await deps.embedQuery(args.text);
    return deps.clusters.findByVector({
      vector,
      limit: args.limit ?? DEFAULT_LIMIT,
      minScore: args.minScore ?? DEFAULT_MIN_SCORE,
    });
  },
});

/* Search service for finding clusters by text. */
export type Search = ReturnType<typeof createSearch>;
