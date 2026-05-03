import { createContext, useContext } from "react";
import type { createController } from "./controller.ts";
import type { MapView } from "./types.ts";

export type Controller = ReturnType<
  ReturnType<typeof createController<SVGSVGElement>>
>;

export type ContextValue = {
  command: MapView;
  subscribe: Controller["subscribe"];
  getSnapshot: Controller["getSnapshot"];
};

export const Context = createContext<ContextValue | null>(null);

export const useContextOrThrow = (caller: string): ContextValue => {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error(`${caller} must be called inside MapView`);
  }
  return ctx;
};
