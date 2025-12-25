import type { QdrantClient } from "@qdrant/js-client-rest";
import { buildFilter } from "../buildFilter.js";
import type { MatchFilter, PaginatedSearchResult } from "./types.js";

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

type Dependencies = {
  client: QdrantClient;
  collectionName: string;
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
  { client, collectionName }: Dependencies,
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

  const allItems = response.points.map((point) => ({
    id: String(point.id),
    score: 1,
    metadata: point.payload as Record<string, unknown> | undefined,
  }));

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
