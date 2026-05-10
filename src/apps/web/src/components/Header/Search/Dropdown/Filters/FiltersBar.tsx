import { rootRouteId, useSearch } from "@tanstack/react-router";
import styled from "styled-components";
import { useSearchActions } from "../../useSearchActions.ts";
import { MinScoreFilter } from "./MinScoreFilter.tsx";

export const FiltersBar = () => {
  const { minScore } = useSearch({ from: rootRouteId });
  const { setMinScore } = useSearchActions();

  return (
    <Bar>
      <MinScoreFilter value={minScore} onChange={setMinScore} />
    </Bar>
  );
};

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
