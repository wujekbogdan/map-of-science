import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseClusterPdf } from "./parse-cluster.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(currentDir, "__fixtures__");

const loadTestPdf = (filename: string) => readFile(join(fixturesDir, filename));

describe("parseClusterPdf", () => {
  it("should extract data from a regular PDF", async () => {
    const data = await loadTestPdf("cluster_42.pdf");
    const result = await parseClusterPdf(data);

    expect(result).toEqual({
      id: 42,
      totalArticles: 269,
      articles: {
        core: [
          "An Investigative Study on the Progress of Nanoclay-Reinforced Polymers: Preparation, Properties, and Applications: A Review",
          "Mechanical, thermal, and morphological properties of low-density polyethylene nanocomposites reinforced with montmorillonite: Fabrication and characterizations",
          "Polysaccharide-Fibrous Clay Bionanocomposites and their Applications",
          "The effect of montmorillonite modification and the use of coupling agent on mechanical properties of polypropylene–clay nanocomposites",
          "Mechanical and Moisture Barrier Properties of Epoxy–Nanoclay and Hybrid Epoxy–Nanoclay Glass Fibre Composites: A Review",
          "Coupled thermal stress and moisture absorption in modified a montmorillonite/copolymer nanocomposite: Experimental study",
          "State-of-the-Art Nanoclay Reinforcement in Green Polymeric Nanocomposite: From Design to New Opportunities",
        ],
        review: [
          "Development of polyurethane/clay nanocomposites based on palm oil polyol",
          "An Investigative Study on the Progress of Nanoclay-Reinforced Polymers: Preparation, Properties, and Applications: A Review",
          "Epoxy Nanocomposites with Silicon-Based Nanomaterials",
          "Polymer Nanocomposites",
          "Micro‐ and Nanoscale Structure Formation in Epoxy‐Clay Nanocomposites",
          "Mechanical and Moisture Barrier Properties of Epoxy–Nanoclay and Hybrid Epoxy–Nanoclay Glass Fibre Composites: A Review",
          "Current synthesis and characterization techniques for clay-based polymer nano-composites and its biomedical applications: A review",
          "Effect of melt blending processing on mechanical properties of polymer nanocomposites: a review",
        ],
        highlyCited: [
          "Physico‐mechanical, rheological and gas barrier properties of organoclay and inorganic phyllosilicate reinforced thermoplastic films",
          "An Investigative Study on the Progress of Nanoclay-Reinforced Polymers: Preparation, Properties, and Applications: A Review",
          "Effect of organo-smectite clays on the mechanical properties and thermal stability of EVA nanocomposites",
          "Single-Lap Joints Bonded with Epoxy Nanocomposite Adhesives: Effect of Organoclay Reinforcement on Adhesion and Fatigue Behaviors",
          "Current synthesis and characterization techniques for clay-based polymer nano-composites and its biomedical applications: A review",
          "Electrochemical and Mechanical Studies of Epoxy Coatings Containing Eco-Friendly Nanocomposite Consisting of Silane Functionalized Clay–Epoxy on Mild Steel",
          "State-of-the-Art Nanoclay Reinforcement in Green Polymeric Nanocomposite: From Design to New Opportunities",
        ],
      },
    });
  });

  it("Should handle a PDF with empty sections and no links", async () => {
    const data = await loadTestPdf("cluster_55922.pdf");
    const result = await parseClusterPdf(data);

    expect(result.articles.review).toEqual([]);
    expect(result.articles.core.length).toBeGreaterThan(0);
    expect(result.articles.highlyCited.length).toBeGreaterThan(0);
    expect(result.articles).toMatchSnapshot();
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
    const hasMergedMetadata = allTitles.some((t) => t.includes("citations."));
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

    const hasFullIproxTitle = allTitles.some((t) =>
      t.includes("iProX in 2021"),
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
    expect(result.articles.core).toContain(
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
