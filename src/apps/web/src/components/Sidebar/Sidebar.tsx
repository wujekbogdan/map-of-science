import { ReactNode } from "react";
import styled from "styled-components";

type Props = {
  isOpen: boolean;
  children: ReactNode;
};

export const Sidebar = ({ isOpen, children }: Props) => (
  <Container $open={isOpen} data-testid="sidebar" data-open={isOpen}>
    {children}
  </Container>
);

const Container = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: var(--sidebar-width);
  max-width: 100%;
  background: white;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  padding: calc(var(--chrome-offset) * 2 + var(--search-height))
    var(--chrome-offset) var(--chrome-offset);
  display: ${(p) => (p.$open ? "block" : "none")};
`;
