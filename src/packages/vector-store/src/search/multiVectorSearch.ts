import type { QdrantClient } from "@qdrant/js-client-rest";
import { z } from "zod";
import { buildFilter } from "../buildFilter.js";
import type {
  MatchFilter,
  MultiVectorQuery,
  PaginatedSearchResult,
} from "./types.js";

const metadataSchema = z.record(z.string(), z.unknown()).optional();

const searchResultSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  score: z.number(),
  payload: metadataSchema,
});

type Params = {
  query: MultiVectorQuery;
  filter?: MatchFilter[];
  limit: number;
  offset: number;
};

type Dependencies = {
  client: QdrantClient;
  collectionName: string;
};

const validatePrefetchLimits = (
  prefetch: MultiVectorQuery["prefetch"],
  minLimit: number,
) => {
  const invalid = prefetch.filter((p) => p.limit < minLimit);
  if (invalid.length > 0) {
    const details = invalid.map((p) => `"${p.using}" (${p.limit})`).join(", ");
    throw new Error(
      `Prefetch limits ${details} must be >= limit + offset (${minLimit})`,
    );
  }
};

const buildFusionQuery = (fusion: MultiVectorQuery["fusion"]) => {
  switch (fusion.type) {
    case "rrf":
      return { fusion: "rrf" as const };
    case "dbsf":
      return { fusion: "dbsf" as const };
    case "weightedSum":
      return {
        formula: {
          sum: [
            { mult: [fusion.weights[0], "$score[0]"] },
            { mult: [fusion.weights[1], "$score[1]"] },
          ],
        },
      };
  }
};

export const multiVectorSearch = async (
  { query, filter, limit, offset }: Params,
  { client, collectionName }: Dependencies,
): Promise<PaginatedSearchResult> => {
  const { prefetch, fusion, scoreThreshold } = query;

  validatePrefetchLimits(prefetch, limit + offset);

  const qdrantFilter = filter?.length ? buildFilter(filter) : undefined;
  const fetchLimit = limit + 1;

  const prefetchRequests = prefetch.map((p) => ({
    query: p.vector,
    using: p.using,
    limit: p.limit,
    score_threshold: p.scoreThreshold,
  }));

  const response = await client.query(collectionName, {
    prefetch: prefetchRequests,
    query: buildFusionQuery(fusion),
    limit: fetchLimit,
    offset,
    score_threshold: scoreThreshold,
    filter: qdrantFilter,
    with_payload: true,
  });

  const items = response.points.map((item) => {
    const parsed = searchResultSchema.parse(item);
    return { id: parsed.id, score: parsed.score, metadata: parsed.payload };
  });

  const hasMore = items.length > limit;
  return {
    items: hasMore ? items.slice(0, limit) : items,
    nextOffset: hasMore ? offset + limit : null,
  };
};
