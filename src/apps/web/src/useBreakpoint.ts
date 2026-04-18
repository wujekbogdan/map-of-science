import { useMediaQuery } from "@uidotdev/usehooks";
import { sm, md, lg, xl, xxl } from "./css/breakpoints.module.scss";

export const breakpoints = {
  sm: sm,
  md: md,
  lg: lg,
  xl: xl,
  xxl: xxl,
} as const;
type Breakpoint = keyof typeof breakpoints;

export const useBreakpointMin = (breakpoint: Breakpoint) => {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]})`);
};

export const useBreakpointMax = (breakpoint: Breakpoint) => {
  return useMediaQuery(
    `(max-width: ${parseInt(breakpoints[breakpoint], 10) - 1}px)`,
  );
};

export const useBreakpointBetween = (min: Breakpoint, max: Breakpoint) => {
  return useMediaQuery(
    `(min-width: ${breakpoints[min]}) and (max-width: ${parseInt(breakpoints[max], 10) - 1}px)`,
  );
};
