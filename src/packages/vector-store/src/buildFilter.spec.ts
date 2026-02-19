import { describe, it, expect } from "vitest";
import { buildFilter } from "./buildFilter.js";

describe("buildFilter", () => {
  it("single filter becomes direct must condition", () => {
    const result = buildFilter([{ key: "status", match: "approved" }]);

    expect(result).toEqual({
      must: [{ key: "status", match: { value: "approved" } }],
    });
  });

  it("different keys are AND-ed together", () => {
    const result = buildFilter([
      { key: "cuisines", match: "italian" },
      { key: "dishTypes", match: "main-course" },
    ]);

    expect(result).toEqual({
      must: [
        { key: "cuisines", match: { value: "italian" } },
        { key: "dishTypes", match: { value: "main-course" } },
      ],
    });
  });

  it("same key values are OR-ed with should", () => {
    const result = buildFilter([
      { key: "cuisines", match: "italian" },
      { key: "cuisines", match: "korean" },
    ]);

    expect(result).toEqual({
      must: [
        {
          should: [
            { key: "cuisines", match: { value: "italian" } },
            { key: "cuisines", match: { value: "korean" } },
          ],
        },
      ],
    });
  });

  it("combines OR within same key and AND between different keys", () => {
    const result = buildFilter([
      { key: "cuisines", match: "italian" },
      { key: "cuisines", match: "korean" },
      { key: "dishTypes", match: "main-course" },
      { key: "status", match: "approved" },
    ]);

    expect(result).toEqual({
      must: [
        {
          should: [
            { key: "cuisines", match: { value: "italian" } },
            { key: "cuisines", match: { value: "korean" } },
          ],
        },
        { key: "dishTypes", match: { value: "main-course" } },
        { key: "status", match: { value: "approved" } },
      ],
    });
  });
});
