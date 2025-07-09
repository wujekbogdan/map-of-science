import { appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { clusters, extract } from "./extractor.js";

const here = import.meta.dirname;

export const generateEmbeddings = async () => {
  const cls = await clusters({
    clusters: resolve(here, "../assets/clusters.tsv"),
    concepts: resolve(here, "../assets/concepts.tsv"),
  });
  let index = 0;
  const outputFile = resolve(
    here,
    `../assets/embeddings-${new Date().getTime()}.tsv`,
  );
  const header = "cluster_id\tconcepts\tembeddings\n";
  appendFileSync(outputFile, header);

  for await (const item of extract(cls)) {
    index++;
    console.log(`Processing item ${index}...`);
    const row = [
      item.clusterId,
      item.concepts.join(","),
      item.embeddings.join(","),
    ].join("\t");
    const tsvRow = `${row}\n`;
    appendFileSync(outputFile, tsvRow);
  }
};
