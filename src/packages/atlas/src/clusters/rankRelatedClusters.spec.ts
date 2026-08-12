import { describe, expect, it } from "vitest";
import { rankRelatedClusters } from "./rankRelatedClusters.js";

describe("rankRelatedClusters", () => {
  it("should rank a cluster by the citations of both directions added together", () => {
    const ranked = rankRelatedClusters({
      topCiting: [
        { externalId: 1, significantCitations: 30 },
        { externalId: 2, significantCitations: 12 },
      ],
      topCited: [
        { externalId: 2, significantCitations: 20 },
        { externalId: 3, significantCitations: 25 },
      ],
    });

    expect(ranked).toEqual([
      { externalId: 2, significantCitations: 32 },
      { externalId: 1, significantCitations: 30 },
      { externalId: 3, significantCitations: 25 },
    ]);
  });

  it("should keep the cluster whose ETO id is zero", () => {
    const ranked = rankRelatedClusters({
      topCiting: [{ externalId: 0, significantCitations: 5 }],
      topCited: [],
    });

    expect(ranked).toEqual([{ externalId: 0, significantCitations: 5 }]);
  });

  it("should return nothing when the cluster has no citation links", () => {
    expect(rankRelatedClusters({ topCiting: [], topCited: [] })).toEqual([]);
  });
});
