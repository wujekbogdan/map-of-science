import type { AtlasStore } from "@map-of-science/atlas-store";
import { buildContentItems } from "./buildContentItems.js";

type YoutubeRow = Parameters<typeof buildContentItems>[0][number];

export const ingestContent = async (deps: {
  contentRepo: AtlasStore["content"];
  readContent: () => Promise<YoutubeRow[]>;
}) => {
  await deps.contentRepo.createSchema();
  const rows = await deps.readContent();
  const items = buildContentItems(rows);
  await deps.contentRepo.upsert(items);
  return { count: items.length };
};
