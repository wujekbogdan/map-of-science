import type { SearchResult } from "./types.js";

type Params = {
  items: SearchResult[];
  limit: number;
  offset: number;
};

export const paginate = ({ items, limit, offset }: Params) => {
  const hasMore = items.length > limit;
  return {
    items: hasMore ? items.slice(0, limit) : items,
    nextOffset: hasMore ? offset + limit : null,
  };
};
