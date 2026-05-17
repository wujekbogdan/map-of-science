import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useMeasure } from "react-use";

export type ViewportRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export const useViewportRect = <T extends Element>() => {
  const [measureRef, sizeRect] = useMeasure<T>();
  const elementRef = useRef<T | null>(null);
  const [rect, setRect] = useState<ViewportRect | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      elementRef.current = node;
      if (node) measureRef(node);
    },
    [measureRef],
  );

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) {
      setRect(null);
      return;
    }
    const next = element.getBoundingClientRect();
    setRect({
      left: next.left,
      top: next.top,
      right: next.right,
      bottom: next.bottom,
    });
  }, [sizeRect.width, sizeRect.height]);

  return [ref, rect] as const;
};
