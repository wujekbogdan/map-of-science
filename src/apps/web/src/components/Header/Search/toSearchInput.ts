import type { RouterInputs } from "@map-of-science/api";

type SearchInput = RouterInputs["search"]["query"];

export const toSearchInput = ({
  text,
  limit,
  minScore,
  sort,
}: {
  text: string;
  limit: number;
  minScore: number;
  sort: SearchInput["sort"];
}): SearchInput => ({ text, limit, minScore, sort });
