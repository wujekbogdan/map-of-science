import { createContext, useContext } from "react";
import type { ViewportRect } from "./useViewportRect.ts";

export const MapRectContext = createContext<ViewportRect | null>(null);

export const useMapRect = () => useContext(MapRectContext);
