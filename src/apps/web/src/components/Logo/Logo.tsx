import styled from "styled-components";
import { breakpoints } from "../../useBreakpoint.ts";
import LogoSvg from "./logo.svg?react";

const Logo = styled(LogoSvg)`
  width: 160px;
  height: auto;
  display: block;
  padding: 6px;

  @media (min-width: ${breakpoints.lg}) {
    width: 200px;
    padding: 12px;
  }
`;

export default Logo;
