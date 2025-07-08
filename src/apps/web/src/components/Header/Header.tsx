import { useState } from "react";
import styled from "styled-components";
import { useBreakpointMin, breakpoints } from "../../useBreakpoint.ts";
import { Search } from "./Search/Search.tsx";
import Toggles from "./Toggles/Toggles.tsx";
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
          <TogglesWrap>
            <Toggles />
          </TogglesWrap>
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

const offset = {
  sm: "6px",
  lg: "12px",
};

const TopBar = styled.div`
  position: fixed;
  padding: ${offset.sm};
  width: 100%;
  display: flex;
  align-items: center;
  z-index: 1;

  @media (min-width: ${breakpoints.lg}) {
    padding: ${offset.lg};
    background: rgba(255, 255, 255, 0.8);
  }
`;

const SearchWrap = styled.div`
  width: 100%;

  @media (min-width: ${breakpoints.lg}) {
    width: 400px;
  }

  @media (min-width: ${breakpoints.xl}) {
    width: 450px;
  }
`;

const TogglesWrap = styled.div`
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
  }
`;

const MenuButton = styled.div<{ $isOpen: boolean }>`
  width: 24px;
  height: 24px;
  margin-left: 12px;
  cursor: pointer;
  margin-right: ${offset.sm};
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
  right: ${offset.lg};
  top: 84px;
`;
