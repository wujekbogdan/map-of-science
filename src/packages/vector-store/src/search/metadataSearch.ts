import { buildFilter } from "../buildFilter.js";
import { parseScrollResult } from "./parseScrollResult.js";
import { MatchFilter, PaginatedSearchResult, SearchDependencies } from "./types.js";

type OrderBy = {
  key: string;
  direction: "asc" | "desc";
};

type Params = {
  filter: MatchFilter[];
  limit: number;
  offset?: string;
  orderBy?: OrderBy;
};

const getStartFrom = (
  orderBy: OrderBy | undefined,
  offset: string | undefined,
) => {
  if (!orderBy || !offset) return undefined;
  const value = Number(offset);
  return orderBy.direction === "desc" ? value - 1 : value + 1;
};

export const metadataSearch = async (
  { filter, limit, offset, orderBy }: Params,
  { client, collectionName }: SearchDependencies,
): Promise<PaginatedSearchResult> => {
  const qdrantFilter = filter.length ? buildFilter(filter) : undefined;
  const fetchLimit = limit + 1;
  const scrollLimit = orderBy ? fetchLimit : limit;

  const response = await client.scroll(collectionName, {
    filter: qdrantFilter,
    limit: scrollLimit,
    offset: orderBy ? undefined : offset,
    with_payload: true,
    with_vector: false,
    order_by: orderBy
      ? {
          key: orderBy.key,
          direction: orderBy.direction,
          start_from: getStartFrom(orderBy, offset),
        }
      : undefined,
  });

  const allItems = response.points.map(parseScrollResult);

  if (orderBy) {
    const hasMore = allItems.length > limit;
    const items = hasMore ? allItems.slice(0, limit) : allItems;
    const lastItem = items[items.length - 1];
    return {
      items,
      nextOffset:
        hasMore && lastItem ? String(lastItem.metadata?.[orderBy.key]) : null,
    };
  }

  const nextPageOffset = response.next_page_offset;
  return {
    items: allItems,
    nextOffset:
      typeof nextPageOffset === "string" || typeof nextPageOffset === "number"
        ? String(nextPageOffset)
        : null,
  };
};
