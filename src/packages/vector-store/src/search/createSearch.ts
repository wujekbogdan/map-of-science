import type { QdrantClient } from "@qdrant/js-client-rest";
import { metadataSearch } from "./metadataSearch.js";
import { multiVectorSearch } from "./multiVectorSearch.js";
import { singleVectorSearch } from "./singleVectorSearch.js";
import type { PaginatedSearchResult, SearchParams } from "./types.js";

type Dependencies = {
  client: QdrantClient;
  collectionName: string;
};

export const createSearch =
  (deps: Dependencies) =>
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
