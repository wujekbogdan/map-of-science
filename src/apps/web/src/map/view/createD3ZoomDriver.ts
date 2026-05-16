import { zoom as d3Zoom, zoomIdentity, select, type D3ZoomEvent } from "d3";
import type { CreateDriver } from "./driver.ts";
import type { Transform } from "./transform.ts";

export const createD3ZoomDriver: CreateDriver<SVGSVGElement> = ({
  surface,
  callbacks,
  initial,
  scaleExtent,
}) => {
  const behavior = d3Zoom<SVGSVGElement, unknown>()
    .scaleExtent([scaleExtent.min, scaleExtent.max])
    .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
      callbacks.onTransform({
        x: event.transform.x,
        y: event.transform.y,
        scale: event.transform.k,
      });
    });

  // d3-zoom skips preventDefault on wheel ticks that clamp at the scale extent,
  // which lets touchpad pinch (wheel + ctrlKey) leak to browser page zoom at the
  // cap. The d3-zoom docs recommend a sibling wheel listener that always calls
  // preventDefault: https://d3js.org/d3-zoom#zoom_scaleExtent
  const onSurfaceWheel = (event: WheelEvent) => {
    event.preventDefault();
  };
  surface.addEventListener("wheel", onSurfaceWheel, { passive: false });

  // d3-zoom suppresses the native click after a pan or zoom gesture, so a click
  // that survives is a tap. Restricting to the surface as its own target keeps
  // taps on rendered content (which sit in descendant nodes) from counting.
  const onSurfaceClick = (event: MouseEvent) => {
    if (event.target === surface) callbacks.onBackgroundTap();
  };
  surface.addEventListener("click", onSurfaceClick);

  const selection = select<SVGSVGElement, unknown>(surface);
  selection.call(behavior);

  const toIdentity = (target: Transform) =>
    zoomIdentity.translate(target.x, target.y).scale(target.scale);

  behavior.transform(selection, toIdentity(initial));
  callbacks.onReady();

  const ANIMATE_MS = 300;

  return {
    applyTransform: (target, { animate }) => {
      const next = toIdentity(target);
      if (animate) {
        selection
          .transition()
          .duration(ANIMATE_MS)
          .call((sel) => {
            behavior.transform(sel, next);
          });
        return;
      }
      behavior.transform(selection, next);
    },
    scaleBy: (factor, { animate }) => {
      if (animate) {
        selection
          .transition()
          .duration(ANIMATE_MS)
          .call((sel) => {
            behavior.scaleBy(sel, factor);
          });
        return;
      }
      behavior.scaleBy(selection, factor);
    },
    detach: () => {
      behavior.on("zoom", null);
      surface.removeEventListener("wheel", onSurfaceWheel);
      surface.removeEventListener("click", onSurfaceClick);
    },
  };
};
