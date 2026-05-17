import { useEffect } from "react";
import { useCoveredAreaStore } from "./coveredAreaStore.ts";
import { useMapRect } from "./mapRectContext.ts";
import { toContribution } from "./toContribution.ts";
import { useViewportRect } from "./useViewportRect.ts";

export const useCoveredArea = <T extends Element>({
  id,
  edge,
  active,
}: {
  id: string;
  edge: "left" | "top";
  active: boolean;
}) => {
  const [ref, panelRect] = useViewportRect<T>();
  const mapRect = useMapRect();
  const setCoveredArea = useCoveredAreaStore((state) => state.setCoveredArea);

  useEffect(() => {
    if (!active || !panelRect || !mapRect) {
      setCoveredArea(id, { [edge]: 0 });
      return;
    }
    setCoveredArea(id, toContribution({ panelRect, mapRect, edge }));
  }, [id, edge, active, panelRect, mapRect, setCoveredArea]);

  return ref;
};
