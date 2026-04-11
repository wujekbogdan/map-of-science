import type { ClusterMatch, ClusterRepository } from "../clusters/clusters.js";

export type EmbedQuery = (text: string) => Promise<number[]>;

const DEFAULT_LIMIT = 50;

export const createSearch = (deps: {
  clusters: Pick<ClusterRepository, "findByVector">;
  embedQuery: EmbedQuery;
}) => ({
  async query(args: { text: string; limit?: number }): Promise<ClusterMatch[]> {
    const vector = await deps.embedQuery(args.text);
    return deps.clusters.findByVector({
      vector,
      limit: args.limit ?? DEFAULT_LIMIT,
    });
  },
});
