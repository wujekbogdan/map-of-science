import { create } from "zustand";
import { combine } from "zustand/middleware";
import type { RouterOutputs } from "../api-client/index.ts";

export type SelectedCluster = RouterOutputs["search"]["query"][number];

export const useSelectionStore = create(
  combine(
    {
      selectedClusters: new Map<string, SelectedCluster>(),
      searchHoveredClusterId: null as string | null,
      isSearchOpen: false,
    },
    (set) => ({
      setSelectedClusters: (clusters: SelectedCluster[]) => {
        set((state) => {
          const current = state.selectedClusters;
          const sameSet =
            current.size === clusters.length &&
            clusters.every((cluster) => current.has(cluster.id));
          if (sameSet) return state;
          return {
            selectedClusters: new Map(
              clusters.map((cluster) => [cluster.id, cluster]),
            ),
          };
        });
      },
      clearSelection: () => {
        set({ selectedClusters: new Map() });
      },
      setSearchHoveredCluster: (id: string | null) => {
        set({ searchHoveredClusterId: id });
      },
      setSearchOpen: (open: boolean) => {
        set({ isSearchOpen: open });
      },
    }),
  ),
);
