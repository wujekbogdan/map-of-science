import RBush from "rbush";
import type { Bbox } from "./labelBbox.ts";

export const placeLabels = ({
  candidates,
  obstacles = [],
}: {
  candidates: { id: string; bbox: Bbox }[];
  obstacles?: Bbox[];
}) => {
  const tree = new RBush<Bbox>();
  tree.load(obstacles);

  return candidates.reduce<Set<string>>((kept, { id, bbox }) => {
    if (tree.collides(bbox)) return kept;
    tree.insert(bbox);
    kept.add(id);
    return kept;
  }, new Set());
};
