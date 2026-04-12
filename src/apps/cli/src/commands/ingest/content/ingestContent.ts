import type { QdrantClient } from "@qdrant/js-client-rest";
import type { AtlasStore } from "@map-of-science/atlas-store";
import { CONTENT_COLLECTION } from "@map-of-science/atlas-store";
import { assertCollectionMissing } from "../assertCollectionMissing.js";
import { buildContentItems } from "./buildContentItems.js";

type YoutubeRow = Parameters<typeof buildContentItems>[0][number];

export const ingestContent = async (deps: {
  qdrant: QdrantClient;
  contentRepo: AtlasStore["content"];
  readContent: () => Promise<YoutubeRow[]>;
}) => {
  await assertCollectionMissing(deps.qdrant, CONTENT_COLLECTION);
  const rows = await deps.readContent();
  const items = buildContentItems(rows);
  await deps.contentRepo.ensureSchema();
  await deps.contentRepo.upsert(items);
  return { count: items.length };
};
