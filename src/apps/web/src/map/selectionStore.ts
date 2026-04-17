import { create } from "zustand";
import { combine } from "zustand/middleware";
import type { RouterOutputs } from "../api-client/index.ts";

export type SelectedCluster = RouterOutputs["search"]["query"][number];

export const useSelectionStore = create(
  combine(
    {
      selectedClusters: new Map<string, SelectedCluster>(),
    },
    (set) => ({
      setSelectedClusters: (clusters: SelectedCluster[]) => {
        set({
          selectedClusters: new Map(
            clusters.map((cluster) => [cluster.id, cluster]),
          ),
        });
      },
      clearSelection: () => {
        set({ selectedClusters: new Map() });
      },
    }),
  ),
);
