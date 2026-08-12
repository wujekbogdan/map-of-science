import type { Cluster } from "./clusters.js";

type RelatedCluster = Cluster["relatedClusters"]["topCiting"][number];

/*
 * Joins a cluster's two citation lists into one list, the strongest link first.
 *
 * A cluster that both cites and is cited counts once.
 * The citations of the two directions are added, because a link that runs both ways is stronger than a link that runs one way.
 * The direction itself is not kept.
 *
 * Every link is in the result.
 */
export const rankRelatedClusters = ({
  topCiting,
  topCited,
}: Cluster["relatedClusters"]): RelatedCluster[] => {
  const combined = [...topCiting, ...topCited].reduce(
    (citationsByCluster, { externalId, significantCitations }) =>
      citationsByCluster.set(
        externalId,
        (citationsByCluster.get(externalId) ?? 0) + significantCitations,
      ),
    new Map<number, number>(),
  );

  return [...combined]
    .map(([externalId, significantCitations]) => ({
      externalId,
      significantCitations,
    }))
    .sort(
      (left, right) => right.significantCitations - left.significantCitations,
    );
};
