import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { rootRouteId, useSearch } from "@tanstack/react-router";
import { useTRPC } from "../../../api-client";
import { useMapStore } from "../../../map/mapStore.ts";
import { parseMinScore } from "./Dropdown/Filters/minScore/filter.ts";
import { parseSort } from "./Dropdown/Filters/sort/filter.ts";
import { MIN_QUERY_LENGTH } from "./searchStore.ts";
import { toSearchInput } from "./toSearchInput.ts";

export { MIN_QUERY_LENGTH };

export const useSearchQuery = (text: string) => {
  const trpc = useTRPC();
  const params = useSearch({ from: rootRouteId });
  const limit = useMapStore((s) => s.maxDataPointsInViewport);
  const minScore = parseMinScore(params);
  const sort = parseSort(params);

  return useQuery(
    trpc.search.query.queryOptions(
      toSearchInput({ text, limit, minScore, sort }),
      {
        enabled: text.length >= MIN_QUERY_LENGTH,
        placeholderData: keepPreviousData,
      },
    ),
  );
};
