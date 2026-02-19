import { groupBy } from "es-toolkit";
import type { MatchFilter } from "./search/types.js";

const toCondition = ({ key, match }: MatchFilter) => ({
  key,
  match: { value: match },
});

// OR within same key, AND between different keys
export const buildFilter = (filters: MatchFilter[]) => ({
  must: Object.values(groupBy(filters, (f) => f.key)).map((group) =>
    group.length === 1
      ? toCondition(group[0])
      : { should: group.map(toCondition) },
  ),
});
