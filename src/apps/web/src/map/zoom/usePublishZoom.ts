import type { ZoomTransform } from "d3";
import { useEffect } from "react";
import { useMapStore } from "../mapStore.ts";

export const usePublishZoom = (transform: ZoomTransform | undefined) => {
  const setCurrentZoom = useMapStore((state) => state.setCurrentZoom);
  useEffect(() => {
    if (!transform) return;
    setCurrentZoom({
      x: transform.x,
      y: transform.y,
      scale: transform.k,
    });
  }, [transform, setCurrentZoom]);
};
