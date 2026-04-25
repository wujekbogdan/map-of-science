import type { ZoomTransform } from "d3";
import { useEffect, useState } from "react";

type Subscribe = (fn: (transform: ZoomTransform) => void) => () => void;

// Mirrors the latest zoom transform into React state, but only swaps the
// reference when k changes. A pan that leaves k untouched keeps the same
// reference, so consumers that key off identity skip work on pan.
export const useLiveZoomTransform = (subscribe: Subscribe) => {
  const [transform, setTransform] = useState<ZoomTransform>();

  useEffect(() => {
    return subscribe((next) => {
      setTransform((prev) => (prev?.k === next.k ? prev : next));
    });
  }, [subscribe]);

  return transform;
};
