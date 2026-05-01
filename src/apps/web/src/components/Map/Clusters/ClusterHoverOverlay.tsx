import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  useTransitionStyles,
  type VirtualElement,
} from "@floating-ui/react";
import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ClusterDetails } from "./ClusterDetails.tsx";
import { type MapCluster } from "./ClusterShapes.tsx";
import { unionRect } from "./unionRect.ts";

type Props = {
  cluster: MapCluster | null;
  dotEl?: SVGGElement | null;
  labelEl?: SVGGElement | null;
};

const EMPTY_RECT = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

export const ClusterHoverOverlay = ({ cluster, dotEl, labelEl }: Props) => {
  const isOpen = cluster !== null;
  // The dot and label are one thing from the user's POV. Anchor the popup to
  // their union so it never covers either, and so neither can lose hover when
  // the popup mounts.
  const virtualReference = useMemo<VirtualElement>(
    () => ({
      getBoundingClientRect: () => {
        const rects = [dotEl, labelEl]
          .filter((el): el is SVGGElement => el != null)
          .map((el) => el.getBoundingClientRect());
        return rects.length > 0 ? unionRect(rects) : EMPTY_RECT;
      },
    }),
    [dotEl, labelEl],
  );
  const { refs, floatingStyles, context } = useFloating<VirtualElement>({
    open: isOpen,
    middleware: [offset(10), flip(), shift({ padding: 10 })],
    whileElementsMounted: autoUpdate,
  });
  useEffect(() => {
    refs.setPositionReference(virtualReference);
  }, [refs, virtualReference]);
  const { isMounted, styles } = useTransitionStyles(context, {
    duration: { open: 300, close: 0 },
    initial: { opacity: 0 },
    open: { opacity: 1 },
  });

  if (!cluster || !isMounted) return null;

  return createPortal(
    <div ref={refs.setFloating} style={{ ...floatingStyles, ...styles }}>
      <ClusterDetails cluster={cluster} />
    </div>,
    document.body,
  );
};
