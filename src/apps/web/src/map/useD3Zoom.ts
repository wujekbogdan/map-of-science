/*
 * Wraps d3-zoom for an SVG map. Declarative from the caller's side - they
 * pass refs, receive React state, but imperative under the hood.
 *
 * d3-zoom emits one event per pointer sample, which on modern displays
 * means 120+ Hz during a pan. Routing every event through React state
 * re-renders the entire Map subtree at that rate; the reconciler can't
 * keep up and the UI drops frames.
 *
 * The per-tick path skips React entirely: the panned <g> gets its
 * `transform` attribute set via the DOM, and other consumers that need
 * to stay in sync hook in via `subscribe`. React still holds what it's
 * good at - component tree and data flow - and receives two React-shaped
 * outputs:
 *   - `zoom`: the current scale. Updated on every zoom event, but pan
 *     doesn't change scale so setZoom returns the same value and React
 *     skips the commit. Only wheel zoom actually re-renders consumers.
 *   - `transform`: updated once per gesture, after the user has stopped
 *     moving. Drives the bbox-based data fetch so we fire one request
 *     per gesture, not one per intermediate frame.
 *
 * `subscribe(fn)` registers a per-tick listener. It fires synchronously
 * on every zoom event, and also once on subscribe with the current
 * transform so late-mounting consumers can paint themselves correctly
 * without waiting for the next tick.
 */
import {
  D3ZoomEvent,
  select,
  zoom as d3Zoom,
  zoomIdentity,
  ZoomTransform,
} from "d3";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useMapStore } from "./mapStore.ts";

type Zoom = {
  x: number;
  y: number;
  scale: number;
};

type Options = {
  /** Root <svg> element that d3-zoom listens on for pointer/wheel input. */
  svg: RefObject<SVGSVGElement | null>;
  /** The <g> that receives the pan/zoom transform. Everything inside it moves. */
  foreground: RefObject<SVGGElement | null>;
  initialZoom: Zoom;
  initialized?: () => void;
  desiredZoom: Zoom | null;
};

const SETTLE_MS = 150;

export const useD3Zoom = ({
  svg,
  foreground,
  initialZoom,
  initialized,
  desiredZoom,
}: Options) => {
  const zoomBehavior = useRef<ReturnType<
    typeof d3Zoom<SVGSVGElement, unknown>
  > | null>(null);
  const hasInitialized = useRef(false);
  const hasZoomed = useRef(false);

  const liveTransformRef = useRef<ZoomTransform>(zoomIdentity);
  const subscribersRef = useRef(new Set<(transform: ZoomTransform) => void>());

  const [transform, setSettledTransform] = useState<ZoomTransform>();
  const [zoom, setZoom] = useState(1);
  const setCurrentZoom = useMapStore((s) => s.setCurrentZoom);

  const settleTimerRef = useRef<number | null>(null);

  const subscribe = useCallback((fn: (transform: ZoomTransform) => void) => {
    subscribersRef.current.add(fn);
    fn(liveTransformRef.current);
    return () => {
      subscribersRef.current.delete(fn);
    };
  }, []);

  const zoomTo = useCallback(
    (
      x: number,
      y: number,
      scale: number,
      animate = true,
      onEnd?: () => void,
    ) => {
      if (!svg.current || !zoomBehavior.current) return;

      const selection = select(svg.current);
      const transform = zoomIdentity.translate(x, y).scale(scale);
      const duration = animate ? 300 : 0;

      selection
        .transition()
        .duration(duration)
        .call((sel) => {
          if (!zoomBehavior.current) return;
          zoomBehavior.current.transform(sel, transform);
        })
        .on("end", () => {
          onEnd?.();
        });
    },
    [svg],
  );

  useEffect(() => {
    if (hasInitialized.current) return;
    if (!svg.current) return;

    zoomBehavior.current = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 50])
      .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        const transform = event.transform;
        liveTransformRef.current = transform;

        foreground.current?.setAttribute("transform", transform.toString());
        for (const fn of subscribersRef.current) fn(transform);

        // Pan doesn't change scale, so setZoom gets the same value and
        // React skips the re-render via Object.is. Only wheel zoom
        // actually re-renders scale consumers. React 18 batches the two
        // setters inside this event handler into a single commit.
        setZoom(transform.k);
        setCurrentZoom({ x: transform.x, y: transform.y, scale: transform.k });

        if (settleTimerRef.current !== null) {
          clearTimeout(settleTimerRef.current);
        }
        settleTimerRef.current = window.setTimeout(() => {
          settleTimerRef.current = null;
          setSettledTransform(liveTransformRef.current);
        }, SETTLE_MS);
      });

    select<SVGSVGElement, unknown>(svg.current).call(zoomBehavior.current);
    hasInitialized.current = true;
  });

  useEffect(() => {
    if (hasZoomed.current) return;
    if (!svg.current || !zoomBehavior.current) return;

    zoomTo(initialZoom.x, initialZoom.y, 1, false, () => {
      initialized?.();
    });
    hasZoomed.current = true;
  });

  useEffect(() => {
    if (!desiredZoom) return;
    zoomTo(desiredZoom.x, desiredZoom.y, desiredZoom.scale, true);
  }, [desiredZoom, desiredZoom?.x, desiredZoom?.y, desiredZoom?.scale, zoomTo]);

  useEffect(
    () => () => {
      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current);
      }
    },
    [],
  );

  return {
    zoom,
    zoomTo,
    transform,
    subscribe,
  };
};

export type ZoomSubscribe = ReturnType<typeof useD3Zoom>["subscribe"];
