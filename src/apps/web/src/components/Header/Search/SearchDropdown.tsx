import { rootRouteId, useSearch } from "@tanstack/react-router";
import { useDebounce } from "@uidotdev/usehooks";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigateToCluster } from "../../../cluster/useNavigateToCluster.ts";
import { useSelectionStore } from "../../../map/selectionStore.ts";
import { useMapView } from "../../../map/view/hooks.ts";
import { Dropdown, type Option } from "./Dropdown/Dropdown.tsx";
import { MIN_QUERY_LENGTH, useSearchStore } from "./searchStore.ts";
import { useSearchActions } from "./useSearchActions.ts";
import { useSearchQuery } from "./useSearchQuery.ts";

const INPUT_DEBOUNCE_MS = 300;

// Binds the search store to the presentational Dropdown. Subscribing to the
// draft here keeps the per-keystroke render confined to this subtree, so the
// component that mounts the search stays out of the typing path.
export const SearchDropdown = ({ filters }: { filters?: ReactNode }) => {
  const draftQuery = useSearchStore((state) => state.draftQuery);
  const setDraftQuery = useSearchStore((state) => state.setDraftQuery);
  const reset = useSearchStore((state) => state.reset);

  const setSelectedClusters = useSelectionStore(
    (state) => state.setSelectedClusters,
  );
  const clearSelection = useSelectionStore((state) => state.clearSelection);
  const setSearchHoveredCluster = useSelectionStore(
    (state) => state.setSearchHoveredCluster,
  );

  const { q = "" } = useSearch({ from: rootRouteId });
  const { commit, clear } = useSearchActions();
  const view = useMapView();
  const navigateToCluster = useNavigateToCluster();
  // Bumps on every explicit submit so an identical-query re-submit still
  // re-fires the fit effect; q alone would not change.
  const [submitVersion, setSubmitVersion] = useState(0);

  // The committed query (URL `?q=`) stays the source of truth. Mirror it into
  // the draft on every external change - deep link, history navigation,
  // commit, clear - and never while typing: the dependency is the committed
  // query, which only changes on those events.
  useEffect(() => {
    setDraftQuery(q);
  }, [q, setDraftQuery]);

  const debouncedDraftQuery = useDebounce(draftQuery, INPUT_DEBOUNCE_MS);
  const isQuerySubmittable = draftQuery.length >= MIN_QUERY_LENGTH;

  const { data, isFetching } = useSearchQuery(debouncedDraftQuery);
  const results = useMemo(() => data ?? [], [data]);
  const matchCount = data?.length;

  const dropdownOptions = useMemo<Option[]>(
    () =>
      results.map((cluster) => ({
        type: "cluster" as const,
        id: cluster.id,
        label: cluster.displayName,
        keyword: cluster.displayName,
        cluster,
      })),
    [results],
  );

  // Focus follows the committed search: when results arrive for the URL's
  // query, select them and fit the map. Decoupling from the click handler
  // avoids the race where commit fires before results have loaded.
  useEffect(() => {
    if (q === "") return;
    if (debouncedDraftQuery !== q) return;
    if (isFetching) return;
    if (results.length === 0) return;
    setSelectedClusters(results);
    view.fitToPoints(results.map((cluster) => cluster.position));
  }, [
    q,
    debouncedDraftQuery,
    isFetching,
    results,
    submitVersion,
    setSelectedClusters,
    view,
  ]);

  // The active option survives a selection only when the Combobox is driven
  // by an explicit anchor (see Dropdown). The anchor follows the last
  // selection and is dropped whenever the result set changes under it.
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const onInput = (text: string) => {
    setDraftQuery(text);
    setSelectedOptionId(null);
  };

  const onSelect = (option: Option) => {
    setSelectedOptionId(option.id);
    if (option.type === "cluster") {
      void navigateToCluster(option.cluster.id);
      return;
    }
    if (option.type === "submit") {
      commit(option.label);
      setSubmitVersion((version) => version + 1);
    }
  };

  const onReset = () => {
    reset();
    clearSelection();
    clear();
    setSelectedOptionId(null);
  };

  return (
    <Dropdown
      value={draftQuery}
      query={debouncedDraftQuery}
      isFetching={isFetching}
      options={dropdownOptions}
      selectedOptionId={selectedOptionId}
      matchCount={matchCount}
      isQuerySubmittable={isQuerySubmittable}
      onInput={onInput}
      onSelect={onSelect}
      onReset={onReset}
      onItemHover={setSearchHoveredCluster}
      filters={filters}
    />
  );
};
