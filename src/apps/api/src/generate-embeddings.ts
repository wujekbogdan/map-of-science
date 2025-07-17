import { appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { clusters, extract } from "./extractor.js";

const here = import.meta.dirname;

export const generateEmbeddings = async (batchSize = 100) => {
  const cls = await clusters({
    clusters: resolve(here, "../assets/clusters.tsv"),
    concepts: resolve(here, "../assets/concepts.tsv"),
  });

  const outputFile = resolve(
    here,
    `../assets/embeddings-${new Date().getTime()}.tsv`,
  );
  const header = "cluster_id\tconcepts\tembeddings\n";
  appendFileSync(outputFile, header);

  console.log(
    `Processing ${cls.length} clusters in batches of ${batchSize}...`,
  );

  for (let i = 0; i < cls.length; i += batchSize) {
    const batch = cls.slice(i, i + batchSize);
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(cls.length / batchSize)}...`,
    );

    const results = await extract(batch);

    results.forEach((item) => {
      const row = [
        item.clusterId,
        item.concepts.join(","),
        item.embeddings.join(","),
      ].join("\t");
      const tsvRow = `${row}\n`;
      appendFileSync(outputFile, tsvRow);
    });
  }
};
