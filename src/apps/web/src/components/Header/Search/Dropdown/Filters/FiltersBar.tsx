import { rootRouteId, useNavigate, useSearch } from "@tanstack/react-router";
import styled from "styled-components";
import { filters } from "./registry.ts";

export const FiltersBar = () => {
  const params = useSearch({ from: rootRouteId });
  const navigate = useNavigate({ from: "/" });

  return (
    <Bar>
      {filters.map((filter) => (
        <filter.Component
          key={filter.id}
          params={params}
          onChange={(next) =>
            void navigate({
              search: (prev) => ({ ...prev, ...next }),
              replace: true,
            })
          }
        />
      ))}
    </Bar>
  );
};

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
