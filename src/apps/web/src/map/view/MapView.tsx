import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Context, type ContextValue, type Controller } from "./context.ts";
import { createController } from "./controller.ts";
import { MapRectContext } from "./mapRectContext.ts";
import type { Transform } from "./transform.ts";
import type { Inset, MapViewConfig } from "./types.ts";
import { useViewportRect } from "./useViewportRect.ts";

export type { MapViewConfig } from "./types.ts";

type Size = { width: number; height: number };

const noInset: Inset = { top: 0, right: 0, bottom: 0, left: 0 };

type BackgroundConfig = {
  imageUrl: string | undefined;
  scaleFactor: number;
  offset: { x: number; y: number };
};

// Natural dimensions of the map.svg image used as the background.
const BACKGROUND_VIEW_BOX = { width: 18340.723, height: 18561.087 };

const backgroundStyle = (
  transform: Transform,
  scaleFactor: number,
  offset: { x: number; y: number },
) => {
  const scale = scaleFactor * transform.scale;
  const width = BACKGROUND_VIEW_BOX.width * scale;
  const height = BACKGROUND_VIEW_BOX.height * scale;
  const positionX = transform.x + offset.x * transform.scale - width / 2;
  const positionY = transform.y + offset.y * transform.scale - height / 2;
  return {
    backgroundSize: `${width.toString()}px ${height.toString()}px`,
    backgroundPosition: `${positionX.toString()}px ${positionY.toString()}px`,
  };
};

/**
 * Renders the map's `<svg>` and provides the view controller to its descendants. Children mount only after the surface is captured, so hooks called from children always observe a fully initialized view.
 */
export const MapView = ({
  config,
  size,
  inset,
  background,
  chrome,
  children,
}: {
  config: MapViewConfig<SVGSVGElement>;
  size: Size;
  /** Pixels of the surface covered by docked chrome. Programmatic camera moves center within the uncovered area. */
  inset?: Inset;
  background?: BackgroundConfig;
  /** HTML siblings of the `<svg>`. Render here for headers, overlays, controls. */
  chrome?: ReactNode;
  /** SVG content. Render here for clusters, areas, foreground groups. */
  children?: ReactNode;
}) => {
  const [svg, setSvg] = useState<SVGSVGElement | null>(null);
  const [controller, setController] = useState<Controller | null>(null);
  const [measureRef, mapRect] = useViewportRect<SVGSVGElement>();

  const setSvgRef = useCallback(
    (node: SVGSVGElement | null) => {
      measureRef(node);
      setSvg(node);
    },
    [measureRef],
  );

  useEffect(() => {
    if (!svg) return;
    const next = createController(config)(svg);
    setController(next);
    return () => {
      next.detach();
      setController(null);
    };
  }, [svg, config]);

  // Sync size during render so commands fired by child effects observe the
  // latest value. setSize is idempotent.
  controller?.setSize(size);
  controller?.setInset(inset ?? noInset);

  useEffect(() => {
    if (!svg || !background?.imageUrl) return;
    svg.style.backgroundImage = `url(${background.imageUrl})`;
    svg.style.backgroundRepeat = "no-repeat";
  }, [svg, background?.imageUrl]);

  const backgroundOffset = background?.offset;
  useEffect(() => {
    if (!svg || !controller || !background?.imageUrl || !backgroundOffset) {
      return;
    }
    const apply = () => {
      Object.assign(
        svg.style,
        backgroundStyle(
          controller.getSnapshot().transform,
          background.scaleFactor,
          backgroundOffset,
        ),
      );
    };
    apply();
    return controller.subscribe(apply);
  }, [
    svg,
    controller,
    background?.imageUrl,
    background?.scaleFactor,
    backgroundOffset,
  ]);

  const value = useMemo<ContextValue | null>(() => {
    if (!controller) return null;
    return {
      command: {
        zoomBy: (factor, options) => controller.zoomBy(factor, options),
        zoomTo: (target, options) => controller.zoomTo(target, options),
        panTo: (point, options) => controller.panTo(point, options),
        centerOn: (point, options) => controller.centerOn(point, options),
        fitToBox: (box, options) => controller.fitToBox(box, options),
        fitToPoints: (points, options) =>
          controller.fitToPoints(points, options),
      },
      subscribe: controller.subscribe,
      getSnapshot: controller.getSnapshot,
      onBackgroundTap: controller.onBackgroundTap,
    };
  }, [controller]);

  return (
    <Context value={value}>
      <MapRectContext value={mapRect}>
        {controller && chrome}
        <svg
          ref={setSvgRef}
          width={size.width}
          height={size.height}
          style={{ display: "block" }}
        >
          {controller && children}
        </svg>
      </MapRectContext>
    </Context>
  );
};
