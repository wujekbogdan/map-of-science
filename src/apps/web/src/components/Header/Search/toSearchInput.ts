import type { RouterInputs } from "@map-of-science/api";
import type { SortSelection } from "./Dropdown/Filters/sort/sortSelection.ts";

type SearchInput = RouterInputs["search"]["query"];

/* Adapter from UI search state to the `search.query` wire input. Each field
 * is identity today; keep the mapping explicit so future UI/wire drift fails
 * here at the boundary, not at the call site. */
export const toSearchInput = (state: {
  text: string;
  limit: number;
  minScore: number;
  sort: SortSelection;
}): SearchInput => ({
  text: state.text,
  limit: state.limit,
  minScore: state.minScore,
  sort: state.sort,
});
