import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import { useContextOrThrow } from "./context.ts";
import type { Transform } from "./transform.ts";
import type { BBox, MapView } from "./types.ts";

/**
 * Returns the command handle for dispatching pan, zoom, and fit operations. Identity is stable for the surrounding `<MapView>`'s lifetime, so the handle is safe to use in effect dependency arrays.
 */
export const useMapView = (): MapView =>
  useContextOrThrow("useMapView").command;

/**
 * Subscribes to the current scale. Re-renders only on scale changes; updates that leave scale unchanged are ignored.
 */
export const useMapViewScale = (): number => {
  const { subscribe, getSnapshot } = useContextOrThrow("useMapViewScale");
  return useSyncExternalStore(subscribe, () => getSnapshot().transform.scale);
};

/**
 * Subscribes to the bounding box of the visible viewport. Null until a transform settles. Updates each time a new transform settles or `size` changes after a settle.
 */
export const useMapViewBbox = (): BBox | null => {
  const { subscribe, getSnapshot } = useContextOrThrow("useMapViewBbox");
  return useSyncExternalStore(subscribe, () => getSnapshot().bbox);
};

/**
 * True once the view has applied its initial transform and is ready to accept commands. Useful for hiding placeholder UI during first paint.
 */
export const useMapViewIsReady = (): boolean => {
  const { subscribe, getSnapshot } = useContextOrThrow("useMapViewIsReady");
  return useSyncExternalStore(subscribe, () => getSnapshot().isReady);
};

/**
 * True while the view is at rest. Flips to false on the first transform change of a pan or zoom gesture and back to true once the transform has been quiet for the configured debounce window. True at mount before any gesture. Useful for gating interactions that should pause during gestures.
 */
export const useMapViewIsSettled = (): boolean => {
  const { subscribe, getSnapshot } = useContextOrThrow("useMapViewIsSettled");
  return useSyncExternalStore(subscribe, () => getSnapshot().isSettled);
};

/**
 * Subscribes to the current transform. The returned reference is the same across updates that leave `scale` unchanged. Use it as a memo dep to recompute only when the visible scale changes.
 */
export const useMapViewTransform = (): Transform => {
  const { subscribe, getSnapshot } = useContextOrThrow("useMapViewTransform");
  const cached = useRef<Transform | undefined>(undefined);
  return useSyncExternalStore(subscribe, () => {
    const next = getSnapshot().transform;
    if (cached.current?.scale === next.scale) {
      return cached.current;
    }
    cached.current = next;
    return next;
  });
};

/**
 * Keeps the bound element's `transform` attribute in sync with the view's current transform. Updates skip React re-renders so they can match the cadence of continuous pan and zoom gestures.
 */
export const useBindZoomable = (ref: RefObject<SVGGElement | null>) => {
  const { subscribe, getSnapshot } = useContextOrThrow("useBindZoomable");
  useEffect(() => {
    const apply = () => {
      const el = ref.current;
      if (!el) return;
      const { x, y, scale } = getSnapshot().transform;
      el.setAttribute("transform", `translate(${x},${y}) scale(${scale})`);
    };
    apply();
    return subscribe(apply);
  }, [ref, subscribe, getSnapshot]);
};
