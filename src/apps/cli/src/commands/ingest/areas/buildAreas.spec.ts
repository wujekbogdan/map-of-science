import { describe, expect, it } from "vitest";
import { buildAreas } from "./buildAreas.js";

const areaRow = {
  id: "a-1",
  x: "10.5",
  y: "-5.25",
  level: "2",
  cluster_id: "null",
};

const i18nRow = {
  id: "a-1",
  "pl-PL": "Medycyna",
  "en-US": "Medicine",
};

describe("buildAreas", () => {
  it("joins area rows with their i18n names by id", () => {
    const areas = buildAreas([areaRow], [i18nRow]);
    expect(areas).toEqual([
      {
        id: "a-1",
        externalId: "a-1",
        position: { x: 10.5, y: -5.25 },
        tier: 2,
        name: { en_US: "Medicine", pl_PL: "Medycyna" },
      },
    ]);
  });

  it("throws when an area has no matching i18n entry", () => {
    expect(() => buildAreas([areaRow], [])).toThrow(/a-1/);
  });

  it("ignores i18n rows that have no matching area", () => {
    const extraI18n = { id: "other", "pl-PL": "X", "en-US": "X" };
    const areas = buildAreas([areaRow], [i18nRow, extraI18n]);
    expect(areas).toHaveLength(1);
  });
});
