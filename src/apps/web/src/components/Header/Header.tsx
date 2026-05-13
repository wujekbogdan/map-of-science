import { useState } from "react";
import styled from "styled-components";
import { useBreakpointMin, breakpoints } from "../../useBreakpoint.ts";
import Controls from "./Controls/Controls.tsx";
import { Search } from "./Search/Search.tsx";
import { ZoomControls } from "./ZoomControls/ZoomControls.tsx";
import closeIcon from "./close.svg";
import hamburgerIcon from "./hamburger.svg";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAtLeastLg = useBreakpointMin("lg");

  const onHamburgerClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <TopBar>
        <SearchWrap>
          <Search />
        </SearchWrap>
        <MenuButton
          role="button"
          onClick={onHamburgerClick}
          $isOpen={isMenuOpen}
        />
        {(isAtLeastLg || isMenuOpen) && (
          <ControlsWrap>
            <Controls />
          </ControlsWrap>
        )}
      </TopBar>
      {isAtLeastLg && (
        <ZoomControlsWrap>
          <ZoomControls />
        </ZoomControlsWrap>
      )}
    </>
  );
};

const TopBar = styled.div`
  position: fixed;
  padding: var(--chrome-offset);
  width: 100%;
  display: flex;
  align-items: center;
  z-index: 1;
`;

const SearchWrap = styled.div`
  width: calc(var(--sidebar-width) - 2 * var(--chrome-offset));
  max-width: 100%;
`;

const ControlsWrap = styled.div`
  position: fixed;
  right: 6px;
  top: 64px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.4);

  @media (min-width: ${breakpoints.lg}) {
    background: none;
    padding: 0;
    position: static;
    margin-left: auto;
    margin-right: 6px;
  }
`;

const MenuButton = styled.div<{ $isOpen: boolean }>`
  width: 24px;
  height: 24px;
  margin-left: 12px;
  cursor: pointer;
  margin-right: var(--chrome-offset);
  background-size: 24px 24px;
  background-repeat: no-repeat;
  background-image: ${(props) =>
    props.$isOpen ? `url("${closeIcon}")` : `url("${hamburgerIcon}")`};

  @media (min-width: ${breakpoints.lg}) {
    display: none;
  }
`;

const ZoomControlsWrap = styled.div`
  position: fixed;
  right: var(--chrome-offset);
  bottom: var(--chrome-offset);
`;
