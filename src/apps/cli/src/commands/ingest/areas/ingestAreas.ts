import type { QdrantClient } from "@qdrant/js-client-rest";
import type { AtlasStore } from "@map-of-science/atlas-store";
import { AREAS_COLLECTION } from "@map-of-science/atlas-store";
import { assertCollectionMissing } from "../assertCollectionMissing.js";
import { buildAreas } from "./buildAreas.js";

type AreaRow = {
  id: string;
  x: string;
  y: string;
  level: string;
  cluster_id: string;
};

type I18nRow = {
  id: string;
  "pl-PL": string;
  "en-US": string;
};

export const ingestAreas = async (deps: {
  qdrant: QdrantClient;
  areasRepo: AtlasStore["areas"];
  readAreas: () => Promise<AreaRow[]>;
  readI18n: () => Promise<I18nRow[]>;
}) => {
  await assertCollectionMissing(deps.qdrant, AREAS_COLLECTION);
  const [areaRows, i18nRows] = await Promise.all([
    deps.readAreas(),
    deps.readI18n(),
  ]);
  const areas = buildAreas(areaRows, i18nRows);
  await deps.areasRepo.ensureSchema();
  await deps.areasRepo.upsert(areas);
  return { count: areas.length };
};
