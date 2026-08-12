import { describe, expect, it } from "vitest";
import { etoRecordSchema } from "./record.js";

// An eto.ndjson line is a serialized ParsedCluster: article sections hold
// objects, and the title lives under `.title`.
const article = (title: string) => ({
  title,
  metadata: "2023: Nucleic acids research",
  citations: 12,
  doi: null,
});

const payloadFields = {
  id: 7,
  averageArticleAgeYears: 24.95,
  citationRatingPercentile: 55.89,
  patentRatingPercentile: 86.03,
  topJournals: ["Nucleic acids research"],
  topInstitutions: ["Kyushu University"],
  topCompanies: [],
  articles: {
    core: [article("Core One"), article("Core Two")],
    review: [article("Review One")],
    highlyCited: [article("Cited One")],
  },
  relatedClusters: {
    topCiting: [{ id: 0, significantCitations: 35 }],
    topCited: [],
  },
};

const enrichedRecord = { ...payloadFields, totalArticles: 4 };

describe("etoRecordSchema", () => {
  it("should flatten article titles across all sections", () => {
    expect(etoRecordSchema.parse(enrichedRecord).titles).toEqual([
      "Core One",
      "Core Two",
      "Review One",
      "Cited One",
    ]);
  });

  it("should keep the fields the cluster payload is built from", () => {
    expect(etoRecordSchema.parse(enrichedRecord)).toMatchObject(payloadFields);
  });

  it("should reject the legacy string-array article shape", () => {
    const legacyRecord = {
      id: 7,
      articles: { core: ["Core One"], review: [], highlyCited: [] },
    };

    expect(etoRecordSchema.safeParse(legacyRecord).success).toBe(false);
  });
});
