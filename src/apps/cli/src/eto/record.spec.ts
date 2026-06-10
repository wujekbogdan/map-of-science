import { describe, expect, it } from "vitest";
import { etoRecordSchema } from "./record.js";

// An eto.ndjson line is a serialized ParsedCluster: article sections hold
// objects, and the title lives under `.title`.
const enrichedRecord = {
  id: 7,
  totalArticles: 4,
  articles: {
    core: [{ title: "Core One" }, { title: "Core Two" }],
    review: [{ title: "Review One" }],
    highlyCited: [{ title: "Cited One" }],
  },
};

describe("etoRecordSchema", () => {
  it("should flatten article titles across all sections", () => {
    expect(etoRecordSchema.parse(enrichedRecord)).toEqual({
      id: 7,
      titles: ["Core One", "Core Two", "Review One", "Cited One"],
    });
  });

  it("should reject the legacy string-array article shape", () => {
    const legacyRecord = {
      id: 7,
      articles: { core: ["Core One"], review: [], highlyCited: [] },
    };

    expect(etoRecordSchema.safeParse(legacyRecord).success).toBe(false);
  });
});
