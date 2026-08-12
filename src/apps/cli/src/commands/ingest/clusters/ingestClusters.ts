import type { ClusterInput } from "@map-of-science/atlas";
import type { AtlasStore } from "@map-of-science/atlas-store";
import type { EtoRecord } from "../../../eto/record.js";

export const ingestClusters = async ({
  clustersRepo,
  buildCluster,
  embedCluster,
  streamEto,
  batchSize,
}: {
  clustersRepo: AtlasStore["clusters"];
  buildCluster: (args: {
    record: EtoRecord;
    vector: number[];
  }) => ClusterInput | null;
  embedCluster: (cluster: {
    titles: string[];
  }) => Promise<{ vector: number[] }>;
  streamEto: AsyncIterable<EtoRecord>;
  batchSize: number;
}) => {
  await clustersRepo.createSchema();

  let batch: ClusterInput[] = [];
  let count = 0;

  const flush = async () => {
    if (batch.length === 0) return;
    await clustersRepo.upsert(batch);
    count += batch.length;
    batch = [];
  };

  for await (const record of streamEto) {
    const { vector } = await embedCluster({ titles: record.titles });
    const cluster = buildCluster({ record, vector });
    if (!cluster) continue;
    batch.push(cluster);
    if (batch.length >= batchSize) await flush();
  }
  await flush();

  return { count };
};
