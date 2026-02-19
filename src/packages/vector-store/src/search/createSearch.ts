import { metadataSearch } from "./metadataSearch.js";
import { multiVectorSearch } from "./multiVectorSearch.js";
import { singleVectorSearch } from "./singleVectorSearch.js";
import type { PaginatedSearchResult, SearchDependencies, SearchParams } from "./types.js";

export const createSearch =
  (deps: SearchDependencies) =>
  async (params: SearchParams): Promise<PaginatedSearchResult> => {
    const { limit = 10 } = params;

    if (!params.query) {
      const { filter, offset, orderBy } = params;
      return metadataSearch({ filter, limit, offset, orderBy }, deps);
    }

    const { query, filter, offset = 0 } = params;
    switch (query.type) {
      case "single":
        return singleVectorSearch({ query, filter, limit, offset }, deps);
      case "multi":
        return multiVectorSearch({ query, filter, limit, offset }, deps);
    }
  };
