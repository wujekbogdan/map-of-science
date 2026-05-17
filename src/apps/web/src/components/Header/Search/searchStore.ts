import { create } from "zustand";
import { combine } from "zustand/middleware";

// Single owner of the search interaction state that the URL does not hold.
//
// `draftQuery` is the editable, not-yet-committed input text. The committed
// query is the URL `?q=` and stays the source of truth for a committed
// search; `draftQuery` is the buffer the user edits before committing. A
// dedicated store (rather than component state) lets consumers in any subtree
// read this without mirroring it through an effect, and keeps the per-keystroke
// render path off the component that orchestrates the search.
//
// `previewedClusterId` is the single match currently under the dropdown cursor
// (mouse or keyboard) - transient, at most one.

export const MIN_QUERY_LENGTH = 3;

export const useSearchStore = create(
  combine(
    {
      draftQuery: "",
      previewedClusterId: null as string | null,
    },
    (set) => ({
      setDraftQuery: (text: string) => {
        set({ draftQuery: text });
      },
      reset: () => {
        set({ draftQuery: "" });
      },
      setPreviewedCluster: (id: string | null) => {
        set({ previewedClusterId: id });
      },
    }),
  ),
);

// A search is active once the draft is long enough to run: long enough that
// one- or two-character noise neither fires a query nor shifts the layout.
export const selectIsSearchActive = (state: { draftQuery: string }) =>
  state.draftQuery.length >= MIN_QUERY_LENGTH;
