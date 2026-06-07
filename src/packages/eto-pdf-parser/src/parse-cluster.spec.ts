import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseClusterPdf } from "./parse-cluster.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(currentDir, "__fixtures__");

const loadTestPdf = (filename: string) => readFile(join(fixturesDir, filename));

describe("parseClusterPdf", () => {
  it("should extract scalars and article entries from a populated PDF", async () => {
    const data = await loadTestPdf("cluster_42.pdf");
    const result = await parseClusterPdf(data);

    expect(result.id).toBe(42);
    expect(result.totalArticles).toBe(269);
    expect(result.averageArticleAgeYears).toBe(16.7);
    expect(result.citationRatingPercentile).toBe(45.88);
    expect(result.patentRatingPercentile).toBe(98.27);

    expect(result.articles.core[0]).toEqual({
      title:
        "An Investigative Study on the Progress of Nanoclay-Reinforced Polymers: Preparation, Properties, and Applications: A Review",
      metadata: "2021: Polymers",
      citations: 74,
      doi: "10.3390/polym13244401",
    });

    expect(result.articles.core.map((article) => article.title)).toEqual([
      "An Investigative Study on the Progress of Nanoclay-Reinforced Polymers: Preparation, Properties, and Applications: A Review",
      "Mechanical, thermal, and morphological properties of low-density polyethylene nanocomposites reinforced with montmorillonite: Fabrication and characterizations",
      "Polysaccharide-Fibrous Clay Bionanocomposites and their Applications",
      "The effect of montmorillonite modification and the use of coupling agent on mechanical properties of polypropylene–clay nanocomposites",
      "Mechanical and Moisture Barrier Properties of Epoxy–Nanoclay and Hybrid Epoxy–Nanoclay Glass Fibre Composites: A Review",
      "Coupled thermal stress and moisture absorption in modified a montmorillonite/copolymer nanocomposite: Experimental study",
      "State-of-the-Art Nanoclay Reinforcement in Green Polymeric Nanocomposite: From Design to New Opportunities",
    ]);
    expect(result.articles.review.map((article) => article.title)).toEqual([
      "Development of polyurethane/clay nanocomposites based on palm oil polyol",
      "An Investigative Study on the Progress of Nanoclay-Reinforced Polymers: Preparation, Properties, and Applications: A Review",
      "Epoxy Nanocomposites with Silicon-Based Nanomaterials",
      "Polymer Nanocomposites",
      "Micro‐ and Nanoscale Structure Formation in Epoxy‐Clay Nanocomposites",
      "Mechanical and Moisture Barrier Properties of Epoxy–Nanoclay and Hybrid Epoxy–Nanoclay Glass Fibre Composites: A Review",
      "Current synthesis and characterization techniques for clay-based polymer nano-composites and its biomedical applications: A review",
      "Effect of melt blending processing on mechanical properties of polymer nanocomposites: a review",
    ]);
    expect(result.articles.highlyCited.map((article) => article.title)).toEqual(
      [
        "Physico‐mechanical, rheological and gas barrier properties of organoclay and inorganic phyllosilicate reinforced thermoplastic films",
        "An Investigative Study on the Progress of Nanoclay-Reinforced Polymers: Preparation, Properties, and Applications: A Review",
        "Effect of organo-smectite clays on the mechanical properties and thermal stability of EVA nanocomposites",
        "Single-Lap Joints Bonded with Epoxy Nanocomposite Adhesives: Effect of Organoclay Reinforcement on Adhesion and Fatigue Behaviors",
        "Current synthesis and characterization techniques for clay-based polymer nano-composites and its biomedical applications: A review",
        "Electrochemical and Mechanical Studies of Epoxy Coatings Containing Eco-Friendly Nanocomposite Consisting of Silane Functionalized Clay–Epoxy on Mild Steel",
        "State-of-the-Art Nanoclay Reinforcement in Green Polymeric Nanocomposite: From Design to New Opportunities",
      ],
    );

    const allDois = [
      ...result.articles.core,
      ...result.articles.review,
      ...result.articles.highlyCited,
    ].map((article) => article.doi);
    expect(allDois.every((doi) => doi !== null)).toBe(true);
  });

  it("should extract source names into topJournals, dropping the article-count column", async () => {
    const data = await loadTestPdf("cluster_17677.pdf");
    const result = await parseClusterPdf(data);

    expect(result.topJournals).toEqual([
      "arXiv (Cornell University)",
      "arXiv.org",
      "IEEE Transactions on Vehicular Technology",
      "IEEE Wireless Communications Letters",
      "arXiv: Information Theory",
      "IEEE Communications Letters",
      "IEEE Transactions on Wireless Communications",
      "IEEE Global Communications Conference",
      "IEEE Internet of Things Journal",
      "arXiv",
    ]);
  });

  it("should keep a year inside a source name instead of reading it as the article count", async () => {
    const data = await loadTestPdf("cluster_9744.pdf");
    const result = await parseClusterPdf(data);

    expect(result.topJournals).toEqual([
      "AIAA Aviation 2019 Forum",
      "arXiv",
      "Computers & Fluids",
      "AIAA SCITECH 2022 Forum",
      "AIAA Journal",
      "Aerospace Science and Technology",
      "International Journal for Numerical Methods in Fluids",
      "AIAA AVIATION 2021 FORUM",
      "Aerospace",
      "arXiv (Cornell University)",
    ]);
  });

  it("should keep SPE 'Day N <date>' session names intact instead of splitting on their numbers", async () => {
    const data = await loadTestPdf("cluster_15809.pdf");
    const result = await parseClusterPdf(data);

    expect(result.topJournals).toEqual([
      "Polymers",
      "Journal of Petroleum Science and Engineering",
      "SPE Annual Technical Conference and Exhibition",
      "SPE Journal",
      "Day 3 Wed, November 17, 2021",
      "SPE Improved Oil Recovery Conference",
      "Day 2 Tue, September 01, 2020",
      "SPE Reservoir Evaluation & Engineering",
      "Journal of Petroleum Exploration and Production Technology",
      "ACS omega",
    ]);
  });

  it("should keep a 'Volume N' number in the source name instead of reading it as the count", async () => {
    const data = await loadTestPdf("cluster_21525.pdf");
    const result = await parseClusterPdf(data);

    expect(result.topJournals.at(-1)).toBe(
      "DO DESENVOLVIMENTO MUNDIAL COMO RESULTADO DE REALIZAÇÕES EM CIÊNCIA E INVESTIGAÇÃO CIENTÍFICA - Volume 2",
    );
    expect(result.topJournals).toHaveLength(10);
  });

  it("should extract CJK source names", async () => {
    const data = await loadTestPdf("cluster_55922.pdf");
    const result = await parseClusterPdf(data);

    expect(result.topJournals).toEqual([
      "电力系统自动化",
      "电网技术",
      "电力自动化设备",
      "中国电力",
      "电力系统保护与控制",
      "电力建设",
      "Frontiers in Energy Research",
      "南方电网技术",
      "Journal of Physics: Conference Series",
      "电工技术学报",
    ]);
  });

  // A two-part journal name with an article count printed between the parts cannot be told apart
  // from two separate sources, so it lands as two entries. Emitted as-is rather than guessed at.
  it("should emit a two-part journal name split across two source entries", async () => {
    const data = await loadTestPdf("cluster_44989.pdf");
    const result = await parseClusterPdf(data);

    expect(result.topJournals).toContain(
      "Bulletin of the Moscow University named S U Vitte Series",
    );
    expect(result.topJournals).toContain("Economics and management");
  });

  it("should extract author-organization names into topInstitutions, dropping both number columns", async () => {
    const data = await loadTestPdf("cluster_17677.pdf");
    const result = await parseClusterPdf(data);

    expect(result.topInstitutions).toEqual([
      "Southeast University - China",
      "University of Electronic Science and Technology of China",
      "Beijing University of Posts and Telecommunications - China",
      "Nanjing University of Posts and Telecommunications - China",
      "Queen Mary University of London - United Kingdom",
      "Xidian University - China",
      "Nanyang Technological University - Singapore",
      "Zhejiang University - China",
      "Shanghai Jiao Tong University - China",
      "Tsinghua University - China",
    ]);
  });

  it("should extract industry-organization names into topCompanies", async () => {
    const data = await loadTestPdf("cluster_17677.pdf");
    const result = await parseClusterPdf(data);

    expect(result.topCompanies).toEqual([
      "China Mobile (China)",
      "ZTE (China)",
      "Huawei Technologies (China)",
      "China Telecom - China",
      "Ericsson (Sweden)",
      "Orange (France)",
      "NTT (Japan)",
      "Samsung (South Korea)",
      "Nokia (Finland)",
      "InterDigital (United Kingdom)",
    ]);
  });

  it("should return an empty topCompanies when the industry table has no data", async () => {
    const data = await loadTestPdf("cluster_18121.pdf");
    const result = await parseClusterPdf(data);

    expect(result.topCompanies).toEqual([]);
    expect(result.topInstitutions.length).toBeGreaterThan(0);
  });

  // An absent industry-organizations table carries no "Yearly citations
  // (average)" header, so the header search must stay inside the section.
  // Running past it matches the "Top funders" header below and pulls the
  // funders table, and the rest of the document, in as company names.
  // cluster_62180 has data in every section after the empty industry table,
  // so nothing downstream halts the overrun, which makes it the reliable
  // reproducer; cluster_18121 escapes only because a later "No data
  // available." happens to stop the scan.
  it("should keep topCompanies empty when the industry section is absent and later sections have data", async () => {
    const data = await loadTestPdf("cluster_62180.pdf");
    const result = await parseClusterPdf(data);

    expect(result.topCompanies).toEqual([]);
  });

  it("should drop link-label artifacts from org names but keep junk-but-real names", async () => {
    const data = await loadTestPdf("cluster_77592.pdf");
    const result = await parseClusterPdf(data);

    expect(result.topInstitutions).not.toContain(
      "View further author information",
    );
    // A bare postal code is genuine (if unresolved) source data, not an extraction artifact.
    expect(result.topInstitutions).toContain("200032");
  });

  it("should keep a postal number that sits inside an org name", async () => {
    const data = await loadTestPdf("cluster_83853.pdf");
    const result = await parseClusterPdf(data);

    expect(result.topInstitutions).toContain(
      "Naval Research Institute, 100161 Beijing, China",
    );
  });

  it("should keep a trailing ZIP code inside an org name", async () => {
    const data = await loadTestPdf("cluster_10701.pdf");
    const result = await parseClusterPdf(data);

    expect(result.topInstitutions).toContain("East Islip, NY 11730");
  });

  it("should emit a bare postal code that is the whole org name verbatim", async () => {
    const data = await loadTestPdf("cluster_63227.pdf");
    const result = await parseClusterPdf(data);

    expect(result.topInstitutions).toContain("710000");
  });

  it("should extract CJK org names", async () => {
    const data = await loadTestPdf("cluster_55922.pdf");
    const result = await parseClusterPdf(data);

    expect(result.topInstitutions).toContain(
      "(北京)华北电力大学电气与电子工程学院 - China",
    );
  });

  it("should extract related clusters as id + significantCitations, dropping the phrases column", async () => {
    const data = await loadTestPdf("cluster_17677.pdf");
    const result = await parseClusterPdf(data);

    expect(result.relatedClusters.topCiting).toEqual([
      { id: 12959, significantCitations: 283 },
      { id: 660, significantCitations: 198 },
      { id: 8070, significantCitations: 169 },
      { id: 54098, significantCitations: 161 },
      { id: 412, significantCitations: 148 },
      { id: 18995, significantCitations: 147 },
      { id: 724, significantCitations: 133 },
      { id: 1453, significantCitations: 129 },
      { id: 9948, significantCitations: 127 },
      { id: 11206, significantCitations: 118 },
    ]);
    expect(result.relatedClusters.topCited).toEqual([
      { id: 412, significantCitations: 561 },
      { id: 660, significantCitations: 472 },
      { id: 1453, significantCitations: 432 },
      { id: 926, significantCitations: 271 },
      { id: 724, significantCitations: 259 },
      { id: 1897, significantCitations: 246 },
      { id: 8070, significantCitations: 229 },
      { id: 12959, significantCitations: 220 },
      { id: 732, significantCitations: 218 },
      { id: 254, significantCitations: 172 },
    ]);
  });

  it("should handle a single-row citing list", async () => {
    const data = await loadTestPdf("cluster_18121.pdf");
    const result = await parseClusterPdf(data);

    expect(result.relatedClusters.topCiting).toEqual([
      { id: 29730, significantCitations: 1 },
    ]);
    expect(result.relatedClusters.topCited).toHaveLength(9);
  });

  it("should stop the cited list before the GitHub repositories section", async () => {
    const data = await loadTestPdf("cluster_10269.pdf");
    const result = await parseClusterPdf(data);

    expect(result.relatedClusters.topCited).toHaveLength(10);
    expect(result.relatedClusters.topCited.at(-1)).toEqual({
      id: 21959,
      significantCitations: 5,
    });
  });

  it("Should handle a PDF with empty sections and no links", async () => {
    const data = await loadTestPdf("cluster_55922.pdf");
    const result = await parseClusterPdf(data);

    expect(result.articles.review).toEqual([]);
    expect(result.articles.core.length).toBeGreaterThan(0);
    expect(result.articles.highlyCited.length).toBeGreaterThan(0);
    const dois = [...result.articles.core, ...result.articles.highlyCited].map(
      (article) => article.doi,
    );
    expect(dois.every((doi) => doi === null)).toBe(true);
    expect(result.articles).toMatchSnapshot();
  });

  it("should attach a doi to linked titles and null to plain-text titles in one cluster", async () => {
    const data = await loadTestPdf("cluster_17677.pdf");
    const result = await parseClusterPdf(data);

    const linked = result.articles.core.find((article) =>
      article.title.startsWith("Active RIS vs. Passive RIS"),
    );
    const plainText = result.articles.core.find((article) =>
      article.title.startsWith(
        "Reconfigurable Intelligent Surface Assisted Multiuser MISO",
      ),
    );

    expect(linked?.doi).toBe("10.1109/TCOMM.2022.3231893");
    expect(plainText?.doi).toBeNull();
  });

  it("should handle PDFs with short metadata format (YYYY. N citations.)", async () => {
    const data = await loadTestPdf("cluster_2.pdf");
    const result = await parseClusterPdf(data);

    expect(result.id).toBe(2);
    const allTitles = [
      ...result.articles.core,
      ...result.articles.review,
      ...result.articles.highlyCited,
    ];
    const hasMergedMetadata = allTitles.some((article) =>
      article.title.includes("citations."),
    );
    expect(hasMergedMetadata).toBe(false);
    expect(result.articles).toMatchSnapshot();
  });

  it("should preserve titles containing year patterns as part of the title text", async () => {
    // cluster_612 has title "iProX in 2021: connecting proteomics data sharing with big data"
    // The "2021:" is part of the title, not metadata - should not truncate
    const data = await loadTestPdf("cluster_612.pdf");
    const result = await parseClusterPdf(data);

    const allTitles = [
      ...result.articles.core,
      ...result.articles.review,
      ...result.articles.highlyCited,
    ];

    const hasFullIproxTitle = allTitles.some((article) =>
      article.title.includes("iProX in 2021"),
    );
    expect(hasFullIproxTitle).toBe(true);
  });

  it("should handle PDFs with missing titles (consecutive citation markers)", async () => {
    // cluster_34 has an entry in Core articles where the title is missing but metadata exists:
    // "...2020: TEST Engineering & Management. 1 citations. 2020: Baghdad Science Journal. 1 citations. A New CBIR..."
    // The "2020: Baghdad Science Journal" entry has no title preceding it.
    // Parser should not throw - it should return the titles that do exist.
    const data = await loadTestPdf("cluster_34.pdf");
    const result = await parseClusterPdf(data);

    expect(result.articles.core.length).toBe(7);
    expect(result.articles.core.map((article) => article.title)).toContain(
      "A New CBIR Search Engine with a Vision Transformer Architecture",
    );
  });

  it("should handle PDFs with RTL text where citation count is displaced", async () => {
    // cluster_6471 has Arabic entries where RTL text causes citation count to appear
    // after the year: "2022: 1 Journal. citations." instead of "2022: Journal. 1 citations."
    const data = await loadTestPdf("cluster_6471.pdf");
    const result = await parseClusterPdf(data);

    expect(result.articles.core.length).toBe(7);
    expect(result.articles.highlyCited.length).toBe(7);
  });
});
