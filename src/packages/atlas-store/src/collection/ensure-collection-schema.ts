import type { QdrantClient } from "@qdrant/js-client-rest";

type CreateCollectionBody = Parameters<QdrantClient["createCollection"]>[1];
type CreatePayloadIndexBody = Parameters<QdrantClient["createPayloadIndex"]>[1];

export type CollectionSchemaSpec = {
  name: string;
  vectors: CreateCollectionBody["vectors"];
  payloadIndexes: readonly CreatePayloadIndexBody[];
};

export const ensureCollectionSchema = async (
  qdrant: QdrantClient,
  spec: CollectionSchemaSpec,
) => {
  const { exists } = await qdrant.collectionExists(spec.name);
  if (exists) return;
  await qdrant.createCollection(spec.name, { vectors: spec.vectors });
  await Promise.all(
    spec.payloadIndexes.map((index) =>
      qdrant.createPayloadIndex(spec.name, { wait: true, ...index }),
    ),
  );
};
