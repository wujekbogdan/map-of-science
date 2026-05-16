import { rootRouteId, useNavigate, useSearch } from "@tanstack/react-router";
import { useDebounce } from "@uidotdev/usehooks";
import { type FormEventHandler, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigateToCluster } from "../../../cluster/useNavigateToCluster.ts";
import { useSelectionStore } from "../../../map/selectionStore.ts";
import { useMapView } from "../../../map/view/hooks.ts";
import { Dropdown, Option } from "./Dropdown/Dropdown.tsx";
import { FiltersBar } from "./Dropdown/Filters/FiltersBar.tsx";
import { useSearchActions } from "./useSearchActions.ts";
import { MIN_QUERY_LENGTH, useSearchQuery } from "./useSearchQuery.ts";

const INPUT_DEBOUNCE_MS = 300;

export const Search = () => {
  const view = useMapView();
  const setSelectedClusters = useSelectionStore((s) => s.setSelectedClusters);
  const clearSelection = useSelectionStore((s) => s.clearSelection);
  const setSearchHoveredCluster = useSelectionStore(
    (s) => s.setSearchHoveredCluster,
  );
  const setSearchOpen = useSelectionStore((s) => s.setSearchOpen);

  const params = useSearch({ from: rootRouteId });
  const { q = "" } = params;
  const { commit } = useSearchActions();
  const navigate = useNavigate();
  // `q` is the committed query and the source of truth; `inputValue` is the
  // editable draft. `previousQ` distinguishes an external `q` change (commit,
  // reset, history navigation) from ordinary re-renders, so the draft re-syncs
  // to the URL only on those changes and is not overwritten while typing.
  const [previousQ, setPreviousQ] = useState(q);
  const [inputValue, setInputValue] = useState(q);
  if (q !== previousQ) {
    setPreviousQ(q);
    setInputValue(q);
  }

  const debouncedInputValue = useDebounce(inputValue, INPUT_DEBOUNCE_MS);
  const isQuerySubmittable = inputValue.length >= MIN_QUERY_LENGTH;

  // A search is active once the typed query is long enough to run. The cluster
  // panel renders in a different part of the tree and can't read this local
  // value, so it goes through the shared store; clear it on unmount so it
  // can't stay stuck on.
  // TODO: routing this local search state through the global store is a
  // shortcut. Revisit how search state is owned once the surrounding work
  // settles.
  useEffect(() => {
    setSearchOpen(isQuerySubmittable);
    return () => {
      setSearchOpen(false);
    };
  }, [isQuerySubmittable, setSearchOpen]);

  const { data, isFetching } = useSearchQuery(debouncedInputValue);
  const results = data ?? [];
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

  const onInput = (query: string) => {
    setInputValue(query);
  };

  // Focus follows the committed search: when results arrive for the URL's `q`,
  // select them and fit the map. Decoupling from the click handler avoids the
  // race where commit fires before results have loaded.
  useEffect(() => {
    if (q === "") return;
    if (debouncedInputValue !== q) return;
    if (isFetching) return;
    if (results.length === 0) return;
    setSelectedClusters(results);
    view.fitToPoints(results.map((cluster) => cluster.position));
  }, [q, debouncedInputValue, isFetching, results, setSelectedClusters, view]);

  const navigateToCluster = useNavigateToCluster();

  const onSelectionChange = (option: Option) => {
    if (option.type === "cluster") {
      void navigateToCluster(option.cluster.id);
      return;
    }
    if (option.type === "submit") {
      commit(option.label);
    }
  };

  const onReset = () => {
    setInputValue("");
    clearSelection();
    void navigate({ to: ".", search: {}, replace: true });
  };

  const onFormSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
  };

  return (
    <Form onSubmit={onFormSubmit}>
      <Dropdown
        value={inputValue}
        query={debouncedInputValue}
        isFetching={isFetching}
        options={dropdownOptions}
        matchCount={matchCount}
        isQuerySubmittable={isQuerySubmittable}
        onInput={onInput}
        onSelect={onSelectionChange}
        onReset={onReset}
        onItemHover={setSearchHoveredCluster}
        filters={<FiltersBar />}
      />
    </Form>
  );
};

const Form = styled.form``;
