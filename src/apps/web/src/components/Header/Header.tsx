import styled from "styled-components";
import { Search } from "./Search/Search.tsx";
import Toggles from "./Toggles/Toggles.tsx";
import { ZoomControls } from "./ZoomControls/ZoomControls.tsx";

export const Header = () => {
  return (
    <>
      <TopBar>
        <Search />
        <TogglesWrap>
          <Toggles />
        </TogglesWrap>
      </TopBar>
      <ZoomControlsWrap>
        <ZoomControls />
      </ZoomControlsWrap>
    </>
  );
};

const offset = "12px";

const TopBar = styled.div`
  background: rgba(255, 255, 255, 0.8);
  position: fixed;
  padding: ${offset};
  width: 100%;
  display: flex;
  align-items: center;
  z-index: 1;
`;

const TogglesWrap = styled.div`
  margin-left: auto;
`;

const ZoomControlsWrap = styled.div`
  top: 84px;
  position: fixed;
  right: ${offset};
`;
