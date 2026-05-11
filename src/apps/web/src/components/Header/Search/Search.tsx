import { rootRouteId, useSearch } from "@tanstack/react-router";
import { useDebounce } from "@uidotdev/usehooks";
import { type FormEventHandler, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  type SelectedCluster,
  useSelectionStore,
} from "../../../map/selectionStore.ts";
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

  const params = useSearch({ from: rootRouteId });
  const { q = "" } = params;
  const { commit, clear } = useSearchActions();
  const [previousQ, setPreviousQ] = useState(q);
  const [inputValue, setInputValue] = useState(q);
  if (q !== previousQ) {
    setPreviousQ(q);
    setInputValue(q);
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

  const focusCluster = (cluster: SelectedCluster) => {
    setSelectedClusters([cluster]);
    view.fitToPoints([cluster.position]);
  };

  const onSelectionChange = (option: Option) => {
    if (option.type === "cluster") {
      focusCluster(option.cluster);
      return;
    }
    if (option.type === "submit") {
      commit(option.label);
    }
  };

  const onReset = () => {
    clear();
    clearSelection();
  };

  const onFormSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
  };

  return (
    <Form onSubmit={onFormSubmit}>
      <Dropdown
        value={inputValue}
        isFetching={isFetching}
        options={dropdownOptions}
        isQuerySubmittable={isQuerySubmittable}
        onInput={onInput}
        onSelect={onSelectionChange}
        onReset={onReset}
        filters={<FiltersBar />}
      />
    </Form>
  );
};

const Form = styled.form``;
