import { buildFilter } from "../buildFilter.js";
import { paginate } from "./paginate.js";
import { parseSearchResult } from "./parseSearchResult.js";
import {
  MatchFilter,
  PaginatedSearchResult, SearchDependencies,
  SingleVectorQuery
} from "./types.js";

type Params = {
  query: SingleVectorQuery;
  filter?: MatchFilter[];
  limit: number;
  offset: number;
};


export const singleVectorSearch = async (
  { query, filter, limit, offset }: Params,
  { client, collectionName }: SearchDependencies,
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

  const items = response.map(parseSearchResult);
  return paginate({ items, limit, offset });
};
