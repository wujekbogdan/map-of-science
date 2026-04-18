import LabelText from "../Label/LabelText.tsx";
import type { MapCluster } from "./ClusterShapes.tsx";

type Props = {
  clusters: MapCluster[];
  label: { fontSize: number; opacity: number; offset: number };
};

export const ClusterLabels = ({ clusters, label }: Props) => {
  if (label.opacity <= 0) return null;

  return (
    <>
      {clusters
        .filter((cluster) => cluster.nameSource === "curated")
        .map((cluster) => (
          <LabelText
            key={cluster.id}
            id={cluster.id}
            x={cluster.position.x}
            y={cluster.position.y - label.offset}
            fontSize={label.fontSize}
            opacity={label.opacity}
            level={4}
          >
            {cluster.displayName}
          </LabelText>
        ))}
    </>
  );
};
