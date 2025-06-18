import styled from "styled-components";
import { Search } from "./Search/Search.tsx";
import { ZoomControls } from "./ZoomControls/ZoomControls.tsx";

export const Header = () => {
  return (
    <>
      <SearchWrap>
        <Search />
      </SearchWrap>
      <ZoomControlsWrap>
        <ZoomControls />
      </ZoomControlsWrap>
    </>
  );
};

const offset = "12px";

const SearchWrap = styled.div`
  background: rgba(255, 255, 255, 0.8);
  position: fixed;
  padding: ${offset};
  width: 100%;
`;

const ZoomControlsWrap = styled.div`
  top: 84px;
  position: fixed;
  right: ${offset};
`;
