import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseCluster } from "./parse-cluster.js";

const fixturesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "__fixtures__",
);
const loadCluster = (id: number): unknown =>
  JSON.parse(readFileSync(join(fixturesDir, `cluster_${id}.jsonl`), "utf8"));

// The required metrics every record must carry. Tests add the article, source, and
// connection lists they need so each exercises one transform in isolation.
const baseRecord = {
  cluster_id: "1",
  NP: "1",
  age: 1,
  citation_percentile: 1,
  n_patents_percentile: 1,
};
const recordWith = (extra: Record<string, unknown>) => ({
  ...baseRecord,
  ...extra,
});
const recordWithCorePaper = (paper: Record<string, unknown>) =>
  recordWith({
    paper_stats: [{ is_core: true, core_rank: 1, times_cited: "0", ...paper }],
  });

describe("parseCluster", () => {
  it("should map a populated cluster to the full parsed shape", () => {
    expect(parseCluster(loadCluster(8322))).toMatchInlineSnapshot(`
      {
        "articles": {
          "core": [
            {
              "citations": 2,
              "doi": "10.5455/jcmr.2021.12.04.37",
              "metadata": "2021: Journal of Complementary Medicine Research",
              "title": "Investigation of the Possible Anti-angiogenic Activity of Iraqi Scabiosa palaestina L. Using Ex Vivo Rat Aorta Ring Assay",
            },
            {
              "citations": 7,
              "doi": "10.21769/bioprotoc.4422",
              "metadata": "2022: Bio-protocol",
              "title": "Immunomagnetic Isolation and Enrichment of Microvascular Endothelial Cells from Human Adipose Tissue.",
            },
            {
              "citations": 9,
              "doi": "10.21203/rs.3.rs-959770/v1",
              "metadata": "2021: Research Square (Research Square)",
              "title": "Isolation And Culture of Rat Intestinal Mucosal Microvascular Endothelial Cells Using Immunomagnetic Beads And Their Marker Expression",
            },
            {
              "citations": 7,
              "doi": "10.1038/s42003-021-02732-8",
              "metadata": "2021: Communications biology",
              "title": "Mitigating the non-specific uptake of immunomagnetic microparticles enables the extraction of endothelium from human fat",
            },
            {
              "citations": 332,
              "doi": "10.1038/s41598-020-67289-8",
              "metadata": "2020: Scientific reports",
              "title": "Angiogenesis Analyzer for ImageJ — A comparative morphometric analysis of “Endothelial Tube Formation Assay” and “Fibrin Bead Assay”",
            },
            {
              "citations": 9,
              "doi": "10.3791/63253",
              "metadata": "2021: Journal of visualized experiments : JoVE",
              "title": "Isolation of Primary Mouse Lung Endothelial Cells",
            },
            {
              "citations": 11,
              "doi": "10.1002/cbin.11448",
              "metadata": "2020: Cell biology international",
              "title": "An effective method of isolating microvascular endothelial cells from the human dermis",
            },
          ],
          "highlyCited": [
            {
              "citations": 332,
              "doi": "10.1038/s41598-020-67289-8",
              "metadata": "2020: Scientific reports",
              "title": "Angiogenesis Analyzer for ImageJ — A comparative morphometric analysis of “Endothelial Tube Formation Assay” and “Fibrin Bead Assay”",
            },
            {
              "citations": 187,
              "doi": "10.1056/NEJMoa2031499",
              "metadata": "2021: The New England journal of medicine",
              "title": "Vaccine Efficacy of ALVAC-HIV and Bivalent Subtype C gp120–MF59 in Adults",
            },
            {
              "citations": 23,
              "doi": "10.3390/ijms22126341",
              "metadata": "2021: International journal of molecular sciences",
              "title": "Endothelial Cell Participation in Inflammatory Reaction",
            },
            {
              "citations": 20,
              "doi": "10.1016/j.biomaterials.2020.119927",
              "metadata": "2020: Biomaterials",
              "title": "Novel Silicon Titanium Diboride Micropatterned Substrates for Cellular Patterning.",
            },
            {
              "citations": 17,
              "doi": "10.1177/0885328220968388",
              "metadata": "2020: Journal of biomaterials applications",
              "title": "Fabricating a pre-vascularized large-sized metabolically-supportive scaffold using Brassica oleracea leaf",
            },
            {
              "citations": 14,
              "doi": "10.1007/978-1-0716-2217-9_12",
              "metadata": "2022: Methods in molecular biology (Clifton, N.J.)",
              "title": "Endothelial Cell Tube Formation Assay: An In Vitro Model for Angiogenesis.",
            },
            {
              "citations": 13,
              "doi": "10.3390/ma13194290",
              "metadata": "2020: Materials (Basel, Switzerland)",
              "title": "Customizable 3D-Printed (Co-)Cultivation Systems for In Vitro Study of Angiogenesis",
            },
            {
              "citations": 11,
              "doi": "10.1002/cbin.11448",
              "metadata": "2020: Cell biology international",
              "title": "An effective method of isolating microvascular endothelial cells from the human dermis",
            },
          ],
          "review": [
            {
              "citations": 5,
              "doi": "10.1007/978-1-0716-2703-7_1",
              "metadata": "2022: Methods in molecular biology (Clifton, N.J.)",
              "title": "Discovery and Development of Tumor Angiogenesis Assays.",
            },
          ],
        },
        "averageArticleAgeYears": 30.56,
        "citationRatingPercentile": 55.36,
        "id": 8322,
        "patentRatingPercentile": 99.05,
        "relatedClusters": {
          "topCited": [
            {
              "id": 43312,
              "significantCitations": 6,
            },
            {
              "id": 1213,
              "significantCitations": 4,
            },
            {
              "id": 9723,
              "significantCitations": 4,
            },
            {
              "id": 23719,
              "significantCitations": 3,
            },
            {
              "id": 7885,
              "significantCitations": 3,
            },
            {
              "id": 7812,
              "significantCitations": 3,
            },
            {
              "id": 1525,
              "significantCitations": 3,
            },
            {
              "id": 3799,
              "significantCitations": 2,
            },
            {
              "id": 7493,
              "significantCitations": 2,
            },
            {
              "id": 22669,
              "significantCitations": 2,
            },
          ],
          "topCiting": [
            {
              "id": 43312,
              "significantCitations": 6,
            },
            {
              "id": 23719,
              "significantCitations": 4,
            },
            {
              "id": 7885,
              "significantCitations": 3,
            },
            {
              "id": 72808,
              "significantCitations": 3,
            },
            {
              "id": 48672,
              "significantCitations": 2,
            },
            {
              "id": 66129,
              "significantCitations": 2,
            },
            {
              "id": 3799,
              "significantCitations": 2,
            },
            {
              "id": 1213,
              "significantCitations": 2,
            },
            {
              "id": 16498,
              "significantCitations": 1,
            },
            {
              "id": 37782,
              "significantCitations": 1,
            },
          ],
        },
        "topCompanies": [
          "GlaxoSmithKline (Switzerland)",
          "GlaxoSmithKline (United States)",
          "GlaxoSmithKline (Belgium)",
          "Sanofi (United States)",
          "GlaxoSmithKline (Italy)",
        ],
        "topInstitutions": [
          "University of Toronto",
          "Ted Rogers Centre for Heart Research",
          "Harvard University",
          "University of Bari Aldo Moro",
          "Zhongda Hospital Southeast University",
          "National Institutes of Health",
          "Boston Children's Hospital",
          "Hospital for Sick Children",
          "University of Houston",
          "Technion – Israel Institute of Technology",
        ],
        "topJournals": [
          "Methods in molecular biology (Clifton, N.J.)",
          "Journal of visualized experiments : JoVE",
          "International journal of molecular sciences",
          "VASCULAR MORPHOGENESIS, 2 EDITION",
          "Investigative ophthalmology & visual science",
          "Protocol Handbook for Cancer Biology",
          "Communications biology",
          "Research Square (Research Square)",
          "Journal of Complementary Medicine Research",
          "Journal of the Epidemiology Foundation of India",
        ],
        "totalArticles": 53,
      }
    `);
  });

  it("should throw when a required cluster metric is missing", () => {
    expect(() =>
      parseCluster({
        cluster_id: "1",
        NP: "1",
        age: 1,
        citation_percentile: 1,
        // n_patents_percentile missing
      }),
    ).toThrow();
  });

  it("should group articles into core, review, and highly cited, ordered by rank", () => {
    const result = parseCluster(
      recordWith({
        paper_stats: [
          {
            title: "Second Core, 2021, J",
            year: "2021",
            times_cited: "1",
            is_core: true,
            core_rank: 2,
          },
          {
            title: "First Core, 2021, J",
            year: "2021",
            times_cited: "1",
            is_core: true,
            core_rank: 1,
          },
          {
            title: "A Review, 2021, J",
            year: "2021",
            times_cited: "1",
            is_review: true,
            review_rank: 1,
          },
          {
            title: "Most Cited, 2021, J",
            year: "2021",
            times_cited: "9",
            is_most_cited: true,
            citation_rank: 1,
          },
        ],
      }),
    );

    expect(result.articles.core.map((article) => article.title)).toEqual([
      "First Core",
      "Second Core",
    ]);
    expect(result.articles.review.map((article) => article.title)).toEqual([
      "A Review",
    ]);
    expect(result.articles.highlyCited.map((article) => article.title)).toEqual(
      ["Most Cited"],
    );
  });

  it.each([
    {
      name: "the article has no source",
      title: "Standalone Title, 2022, ",
      year: "2022",
      expected: { title: "Standalone Title", metadata: "2022" },
    },
    {
      name: "the title contains its own year",
      title:
        "A Book Review, 2020, 312 pp., 2020, Anthropology & Education Quarterly",
      year: "2020",
      expected: {
        title: "A Book Review, 2020, 312 pp.",
        metadata: "2020: Anthropology & Education Quarterly",
      },
    },
    {
      name: "the title spans multiple lines",
      title: "Trend to equilibrium coming\n  out of chemistry, 2024, arXiv",
      year: "2024",
      expected: {
        title: "Trend to equilibrium coming out of chemistry",
        metadata: "2024: arXiv",
      },
    },
  ])(
    "should separate an article's title from its year and source when $name",
    ({ title, year, expected }) => {
      const result = parseCluster(recordWithCorePaper({ title, year }));

      expect(result.articles.core[0]).toMatchObject(expected);
    },
  );

  it("should omit an article that has no title", () => {
    const result = parseCluster(
      recordWithCorePaper({ title: ", 2020, Some Journal", year: "2020" }),
    );

    expect(result.articles.core).toHaveLength(0);
  });

  it("should report an article's total citation count", () => {
    // An ETO record carries two citation-like counts. The reported figure is the
    // total times cited; the other count here is set differently to show it is
    // not used.
    const result = parseCluster(
      recordWithCorePaper({
        title: "Some Title, 2021, Some Journal",
        year: "2021",
        times_cited: "42",
        citations: "99",
      }),
    );

    expect(result.articles.core[0].citations).toBe(42);
  });

  it("should keep only the first ten journals", () => {
    const sources = Array.from({ length: 12 }, (_unused, index) => ({
      source_title: `Journal ${index}`,
    }));
    const result = parseCluster(recordWith({ source_info: sources }));

    expect(result.topJournals).toEqual([
      "Journal 0",
      "Journal 1",
      "Journal 2",
      "Journal 3",
      "Journal 4",
      "Journal 5",
      "Journal 6",
      "Journal 7",
      "Journal 8",
      "Journal 9",
    ]);
  });

  it("should keep companies among the institutions", () => {
    const result = parseCluster(
      recordWith({
        author_orgs: {
          author_org_info: [
            {
              affiliation: { affiliation: "Sinopec (China)" },
              is_company: true,
            },
            { affiliation: { affiliation: "Tsinghua University" } },
          ],
        },
      }),
    );

    expect(result.topInstitutions).toEqual([
      "Sinopec (China)",
      "Tsinghua University",
    ]);
  });

  it("should yield empty lists when the cluster lists no sources or organizations", () => {
    const result = parseCluster(baseRecord);

    expect(result.topJournals).toEqual([]);
    expect(result.topInstitutions).toEqual([]);
    expect(result.topCompanies).toEqual([]);
  });

  it("should route citing and cited clusters to separate lists with renamed counts", () => {
    const result = parseCluster(
      recordWith({
        importing_cluster_counts: [{ importer: "5", num_imports: "3" }],
        exporting_cluster_counts: [{ exporter: "9", num_exports: "2" }],
      }),
    );

    expect(result.relatedClusters.topCiting).toEqual([
      { id: 5, significantCitations: 3 },
    ]);
    expect(result.relatedClusters.topCited).toEqual([
      { id: 9, significantCitations: 2 },
    ]);
  });

  it("should keep every related cluster the record lists, uncapped", () => {
    const citing = Array.from({ length: 12 }, (_unused, index) => ({
      importer: `${index}`,
      num_imports: "1",
    }));
    const result = parseCluster(
      recordWith({ importing_cluster_counts: citing }),
    );

    expect(result.relatedClusters.topCiting).toHaveLength(12);
  });

  it("should yield empty related-cluster lists when the cluster has no connections", () => {
    const result = parseCluster(baseRecord);

    expect(result.relatedClusters.topCiting).toEqual([]);
    expect(result.relatedClusters.topCited).toEqual([]);
  });
});
