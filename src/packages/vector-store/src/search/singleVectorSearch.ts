import type { QdrantClient } from "@qdrant/js-client-rest";
import { z } from "zod";
import { buildFilter } from "../buildFilter.js";
import type {
  MatchFilter,
  PaginatedSearchResult,
  SingleVectorQuery,
} from "./types.js";

const metadataSchema = z.record(z.string(), z.unknown()).optional();

const searchResultSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  score: z.number(),
  payload: metadataSchema,
});

type Params = {
  query: SingleVectorQuery;
  filter?: MatchFilter[];
  limit: number;
  offset: number;
};

type Dependencies = {
  client: QdrantClient;
  collectionName: string;
};

export const singleVectorSearch = async (
  { query, filter, limit, offset }: Params,
  { client, collectionName }: Dependencies,
): Promise<PaginatedSearchResult> => {
  const { using, vector, scoreThreshold = 0.5 } = query;
  const fetchLimit = limit + 1;
  const qdrantFilter = filter?.length ? buildFilter(filter) : undefined;

  const response = await client.search(collectionName, {
    vector: { name: using, vector },
    filter: qdrantFilter,
    limit: fetchLimit,
    offset,
    score_threshold: scoreThreshold,
    with_payload: true,
  });

  const items = response.map((item) => {
    const parsed = searchResultSchema.parse(item);
    return { id: parsed.id, score: parsed.score, metadata: parsed.payload };
  });

  const hasMore = items.length > limit;
  return {
    items: hasMore ? items.slice(0, limit) : items,
    nextOffset: hasMore ? offset + limit : null,
  };
};
