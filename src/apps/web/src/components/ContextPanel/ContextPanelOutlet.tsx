import { Outlet, useMatchRoute } from "@tanstack/react-router";
import styled from "styled-components";
import { CLUSTER_ROUTE_PATH } from "../../cluster/routePath.ts";
import { useClearViewedCluster } from "../../cluster/useClearViewedCluster.ts";
import { useSelectionStore } from "../../map/selectionStore.ts";
import { ContextPanel } from "./ContextPanel.tsx";

export const ContextPanelOutlet = () => {
  const matchRoute = useMatchRoute();
  const isClusterRoute = !!matchRoute({ to: CLUSTER_ROUTE_PATH });
  const isSearchOpen = useSelectionStore((state) => state.isSearchOpen);
  const clearViewedCluster = useClearViewedCluster();

  const onContextPanelClose = () => {
    void clearViewedCluster();
  };

  return (
    <Placement
      $open={isClusterRoute}
      $shifted={isSearchOpen}
      data-testid="context-panel"
      data-test-open={isClusterRoute}
      data-test-shifted={isSearchOpen}
    >
      <ContextPanel onClose={onContextPanelClose}>
        <Outlet />
      </ContextPanel>
    </Placement>
  );
};

const Placement = styled.div<{ $open: boolean; $shifted: boolean }>`
  position: fixed;
  top: calc(var(--chrome-offset) * 2 + var(--search-height));
  bottom: var(--chrome-offset);
  left: ${(p) =>
    p.$shifted
      ? "calc(var(--sidebar-width) + var(--chrome-offset))"
      : "var(--chrome-offset)"};
  width: calc(var(--sidebar-width) - var(--chrome-offset) * 2);
  max-width: 100%;
  display: ${(p) => (p.$open ? "block" : "none")};
  transition: left 220ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
