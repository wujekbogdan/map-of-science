import { rootRouteId, useNavigate, useSearch } from "@tanstack/react-router";
import { useDebounce } from "@uidotdev/usehooks";
import { type FormEventHandler, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useActiveCluster } from "../../../cluster/useActiveCluster.ts";
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

  const params = useSearch({ from: rootRouteId });
  const { q = "" } = params;
  const { commit } = useSearchActions();
  const navigate = useNavigate();
  const activeCluster = useActiveCluster();
  const expectedValue = activeCluster?.displayName ?? q;
  const [previousExpected, setPreviousExpected] = useState(expectedValue);
  const [inputValue, setInputValue] = useState(expectedValue);
  if (expectedValue !== previousExpected) {
    setPreviousExpected(expectedValue);
    setInputValue(expectedValue);
  }

  const debouncedInputValue = useDebounce(inputValue, INPUT_DEBOUNCE_MS);
  const isQuerySubmittable = inputValue.length >= MIN_QUERY_LENGTH;

  const { data: results = [], isFetching } =
    useSearchQuery(debouncedInputValue);

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
    clearSelection();
    void navigate({ to: "/", search: { q: undefined }, replace: true });
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
