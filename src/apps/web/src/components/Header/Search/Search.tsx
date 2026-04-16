import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import debounce from "lodash/debounce";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { useTRPC } from "../../../api-client";
import { flipPositionY } from "../../../map/coords.ts";
import { useMapStore } from "../../../map/mapStore.ts";
import {
  type SelectedCluster,
  useSelectionStore,
} from "../../../map/selectionStore.ts";
import { Dropdown, Option } from "./Dropdown/Dropdown.tsx";
import {
  computeZoomToFit,
  getBoundingBox,
  getCenteredBoundingBox,
} from "./viewport.ts";

const MIN_QUERY_LENGTH = 3;
const SEARCH_LIMIT = 20;
const INPUT_DEBOUNCE_MS = 300;
const LOADING_DELAY_MS = 250;

export const Search = () => {
  const trpc = useTRPC();
  const setDesiredZoom = useMapStore((s) => s.setDesiredZoom);
  const mapSize = useMapStore((s) => s.mapSize);
  const setSelectedClusters = useSelectionStore((s) => s.setSelectedClusters);
  const clearSelection = useSelectionStore((s) => s.clearSelection);

  const [searchTerm, setSearchTerm] = useState("");

  const { data: rawResults = [], isFetching } = useQuery(
    trpc.search.query.queryOptions(
      { text: searchTerm, limit: SEARCH_LIMIT },
      { enabled: searchTerm.length >= MIN_QUERY_LENGTH },
    ),
  );
  const results = useMemo(
    () =>
      rawResults.map((cluster) => ({
        ...cluster,
        position: flipPositionY(cluster.position),
      })),
    [rawResults],
  );
  const isLoading = useDebounce(isFetching, LOADING_DELAY_MS);

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

  const onInput = useMemo(
    () =>
      debounce((query: string) => {
        if (query.length < MIN_QUERY_LENGTH) {
          setSearchTerm("");
          return;
        }
        setSearchTerm(query);
      }, INPUT_DEBOUNCE_MS),
    [],
  );

  const focusCluster = (cluster: SelectedCluster) => {
    setSelectedClusters([cluster]);
    setDesiredZoom(
      computeZoomToFit(
        getCenteredBoundingBox(cluster.position, mapSize),
        mapSize,
      ),
    );
  };

  const focusClusters = (clusters: SelectedCluster[]) => {
    if (clusters.length === 0) return;
    setSelectedClusters(clusters);
    const positions = clusters.map((cluster) => cluster.position);
    setDesiredZoom(
      computeZoomToFit(getBoundingBox(positions, mapSize), mapSize),
    );
  };

  const onSelectionChange = (option: Option) => {
    if (option.type === "cluster") {
      focusCluster(option.cluster);
      return;
    }
    if (option.type === "query") {
      focusClusters(option.clusters);
    }
  };

  const onReset = () => {
    clearSelection();
  };

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Dropdown
        isLoading={isLoading}
        options={dropdownOptions}
        onInput={onInput}
        onSelect={onSelectionChange}
        onReset={onReset}
      />
    </Form>
  );
};

const Form = styled.form``;
