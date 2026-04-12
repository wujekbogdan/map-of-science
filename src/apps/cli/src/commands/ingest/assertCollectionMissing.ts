import type { QdrantClient } from "@qdrant/js-client-rest";

export const assertCollectionMissing = async (
  qdrant: QdrantClient,
  name: string,
) => {
  const { exists } = await qdrant.collectionExists(name);
  if (exists) {
    throw new Error(
      `Collection '${name}' already exists. Drop it manually and re-run.`,
    );
  }
};
