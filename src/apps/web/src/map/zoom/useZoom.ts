import {
  zoom as d3Zoom,
  zoomIdentity,
  select,
  type D3ZoomEvent,
  type ZoomTransform,
} from "d3";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { BBox } from "../bbox.ts";
import { usePublishZoom } from "./usePublishZoom.ts";
import { useZoomBbox } from "./useZoomBbox.ts";
import { useZoomed as useZoomedInternal } from "./useZoomed.ts";
import {
  useZoomedBackground as useZoomedBackgroundInternal,
  type ZoomedBackgroundConfig,
} from "./useZoomedBackground.ts";

type ZoomCoords = { x: number; y: number; scale: number };

type Options = {
  svg: RefObject<SVGSVGElement | null>;
  initialZoom: ZoomCoords;
  desiredZoom: ZoomCoords | null;
  onInitialized?: () => void;
};

const SETTLE_MS = 150;

/* The zoom state of a map. */
export type Zoom = {
  /** Current zoom scale. */
  scale: number;
  /** Current pan/zoom transform. Undefined before the first settled gesture. */
  transform: ZoomTransform | undefined;
  /** Moves and scales the map. */
  zoomTo: (
    x: number,
    y: number,
    scale: number,
    animate?: boolean,
    onEnd?: () => void,
  ) => void;
  /** Binds an element's `transform` attribute to the zoom. */
  useZoomed: (ref: RefObject<SVGGElement | null>) => void;
  /** Binds an element's CSS background to the zoom. */
  useZoomedBackground: (
    ref: RefObject<SVGSVGElement | null>,
    config: ZoomedBackgroundConfig,
  ) => void;
  /** Shares this zoom's settled transform with the rest of the app. */
  usePublish: () => void;
  /** Bounding box of the currently visible region. Null before the first
   *  settled gesture. */
  useBbox: (size: { width: number; height: number }) => BBox | null;
};

export const useZoom = ({
  svg,
  initialZoom,
  desiredZoom,
  onInitialized,
}: Options): Zoom => {
  const [scale, setScale] = useState(1);
  const [transform, setSettledTransform] = useState<ZoomTransform>();

  // Ref rather than state: pointer events hit at monitor refresh rate (e.g. 60 hz), a setState per
  // sample would re-render every consumer on every frame.
  const liveTransformRef = useRef<ZoomTransform>(zoomIdentity);
  const subscribersRef = useRef(new Set<(transform: ZoomTransform) => void>());
  const settleTimerRef = useRef<number | null>(null);
  const zoomBehaviorRef = useRef<ReturnType<
    typeof d3Zoom<SVGSVGElement, unknown>
  > | null>(null);

  const initialZoomRef = useRef(initialZoom);
  const onInitializedRef = useRef(onInitialized);
  useEffect(() => {
    onInitializedRef.current = onInitialized;
  });

  const subscribe = useCallback((fn: (transform: ZoomTransform) => void) => {
    subscribersRef.current.add(fn);
    // Fire once on subscribe so a late-mounting consumer paints the current
    // transform instead of waiting for the next tick.
    fn(liveTransformRef.current);
    return () => {
      subscribersRef.current.delete(fn);
    };
  }, []);

  const zoomTo = useCallback<Zoom["zoomTo"]>(
    (x, y, nextScale, animate = true, onEnd) => {
      const element = svg.current;
      const behavior = zoomBehaviorRef.current;
      if (!element || !behavior) return;
      const selection = select(element);
      const target = zoomIdentity.translate(x, y).scale(nextScale);
      selection
        .transition()
        .duration(animate ? 300 : 0)
        .call((sel) => {
          behavior.transform(sel, target);
        })
        .on("end", () => {
          onEnd?.();
        });
    },
    [svg],
  );

  useLayoutEffect(() => {
    const element = svg.current;
    if (!element) return;

    const behavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 50])
      .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        const next = event.transform;
        liveTransformRef.current = next;
        for (const fn of subscribersRef.current) fn(next);
        // Fires every tick; React skips the commit via Object.is when
        // scale is unchanged (pan keeps k constant).
        setScale(next.k);

        if (settleTimerRef.current !== null) {
          clearTimeout(settleTimerRef.current);
        }
        settleTimerRef.current = window.setTimeout(() => {
          settleTimerRef.current = null;
          setSettledTransform(liveTransformRef.current);
        }, SETTLE_MS);
      });

    zoomBehaviorRef.current = behavior;
    const selection = select<SVGSVGElement, unknown>(element);
    selection.call(behavior);

    const init = initialZoomRef.current;
    selection
      .transition()
      .duration(0)
      .call((sel) => {
        behavior.transform(
          sel,
          zoomIdentity.translate(init.x, init.y).scale(1),
        );
      })
      .on("end", () => {
        onInitializedRef.current?.();
      });

    return () => {
      selection.on(".zoom", null);
      zoomBehaviorRef.current = null;
      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    };
  }, [svg]);

  useEffect(() => {
    if (!desiredZoom) return;
    zoomTo(desiredZoom.x, desiredZoom.y, desiredZoom.scale, true);
  }, [desiredZoom, zoomTo]);

  const useZoomed = (ref: RefObject<SVGGElement | null>) => {
    useZoomedInternal(subscribe, ref);
  };

  const useZoomedBackground = (
    ref: RefObject<SVGSVGElement | null>,
    config: ZoomedBackgroundConfig,
  ) => {
    useZoomedBackgroundInternal(subscribe, ref, config);
  };

  const usePublish = () => {
    usePublishZoom(transform);
  };

  const useBbox = (size: { width: number; height: number }) =>
    useZoomBbox(transform, size);

  return {
    scale,
    transform,
    zoomTo,
    useZoomed,
    useZoomedBackground,
    usePublish,
    useBbox,
  };
};
