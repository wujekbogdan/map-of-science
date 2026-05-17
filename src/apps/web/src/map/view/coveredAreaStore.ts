import { create } from "zustand";
import { combine } from "zustand/middleware";
import type { Inset } from "./types.ts";

// Tracks how much of the viewport each docked panel covers. Panels register
// the pixels they cover on each edge under a stable id. A hidden panel reports
// zeros instead of dropping its entry, so the key set stays fixed and the
// inset always reflects current coverage. A shared store lets panels anywhere
// in the tree report without prop drilling.

type Contribution = Partial<Inset>;

const emptyCoveredAreas: Record<string, Contribution> = {};

export const useCoveredAreaStore = create(
  combine(
    {
      coveredAreas: emptyCoveredAreas,
    },
    (set) => ({
      setCoveredArea: (id: string, contribution: Contribution) => {
        set((state) => ({
          coveredAreas: { ...state.coveredAreas, [id]: contribution },
        }));
      },
    }),
  ),
);

// Largest coverage on each edge across all panels: the uncovered region must
// clear the deepest intrusion per edge.
export const selectInset = (state: {
  coveredAreas: Record<string, Contribution>;
}): Inset =>
  Object.values(state.coveredAreas).reduce<Inset>(
    (inset, contribution) => ({
      top: Math.max(inset.top, contribution.top ?? 0),
      right: Math.max(inset.right, contribution.right ?? 0),
      bottom: Math.max(inset.bottom, contribution.bottom ?? 0),
      left: Math.max(inset.left, contribution.left ?? 0),
    }),
    { top: 0, right: 0, bottom: 0, left: 0 },
  );
