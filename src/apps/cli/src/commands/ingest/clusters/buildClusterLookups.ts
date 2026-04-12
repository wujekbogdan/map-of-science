import type {
  ClusterLookups,
  LocalizedName,
  PositionRow,
} from "./buildCluster.js";

export type ClustersRow = {
  cluster_id: string;
  x: string;
  y: string;
  num_recent_articles: string;
  growth_rating: string;
};

export type LlmNameRow = {
  cluster_id: string;
  "en-US": string;
  "pl-PL": string;
};

export type PlacesRow = {
  id: string;
  cluster_id: string;
};

export type EntityNameRow = {
  id: string;
  "en-US": string;
  "pl-PL": string;
};

const toLocalized = (row: {
  "en-US": string;
  "pl-PL": string;
}): LocalizedName => ({
  en_US: row["en-US"],
  pl_PL: row["pl-PL"],
});

const buildPositions = (rows: ClustersRow[]) =>
  new Map<string, PositionRow>(
    rows.map((row) => [
      row.cluster_id,
      {
        x: Number(row.x),
        y: Number(row.y),
        articlesCount: Number(row.num_recent_articles),
        growthRating: Number(row.growth_rating),
      },
    ]),
  );

const buildLlmNames = (rows: LlmNameRow[]) =>
  new Map<string, LocalizedName>(
    rows.map((row) => [row.cluster_id, toLocalized(row)]),
  );

const buildCuratedNames = (
  placesRows: PlacesRow[],
  entityNameRows: EntityNameRow[],
) => {
  const entityById = new Map(entityNameRows.map((row) => [row.id, row]));
  return new Map<string, LocalizedName>(
    placesRows.flatMap((place) => {
      const entity = entityById.get(place.id);
      return entity ? [[place.cluster_id, toLocalized(entity)]] : [];
    }),
  );
};

export const buildClusterLookups = ({
  clustersRows,
  llmNameRows,
  placesRows,
  entityNameRows,
}: {
  clustersRows: ClustersRow[];
  llmNameRows: LlmNameRow[];
  placesRows: PlacesRow[];
  entityNameRows: EntityNameRow[];
}): ClusterLookups => ({
  positions: buildPositions(clustersRows),
  llmNames: buildLlmNames(llmNameRows),
  curatedNames: buildCuratedNames(placesRows, entityNameRows),
});
