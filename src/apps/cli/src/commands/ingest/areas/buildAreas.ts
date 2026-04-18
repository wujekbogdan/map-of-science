import { type Area, areaSchema } from "@map-of-science/atlas";

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

export const buildAreas = (
  areaRows: AreaRow[],
  i18nRows: I18nRow[],
): Area[] => {
  const i18nById = new Map(i18nRows.map((row) => [row.id, row]));

  return areaRows.map((row) => {
    const i18n = i18nById.get(row.id);
    if (!i18n) {
      throw new Error(`Missing i18n entry for area '${row.id}'`);
    }

    return areaSchema.parse({
      id: row.id,
      externalId: row.id,
      position: { x: Number(row.x), y: Number(row.y) },
      tier: Number(row.level),
      name: { en_US: i18n["en-US"], pl_PL: i18n["pl-PL"] },
    });
  });
};
