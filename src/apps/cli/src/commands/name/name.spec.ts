import path from "node:path";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { name } from "./name.js";

const CLUSTERS_FIXTURE_PATH = path.join(
  import.meta.dirname,
  "../../__test__/clusters.json",
);

vi.mock("@map-of-science/text-generator", () => ({
  createGenerator: () => ({
    generate: vi.fn().mockResolvedValue({
      object: { english: "mocked label" },
      price: { raw: 0.001, formatted: "$0.001" },
    }),
  }),
}));

describe("name command", () => {
  beforeEach(() => {
    vi.stubEnv("GOOGLE_API_KEY", "test-key");
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should process clusters and output TSV", async () => {
    await name({
      input: CLUSTERS_FIXTURE_PATH,
      limit: "2",
    });

    expect(console.log).toHaveBeenNthCalledWith(1, "cluster_id\tlabel");
    expect(console.log).toHaveBeenNthCalledWith(2, "0\tMocked label");
    expect(console.log).toHaveBeenNthCalledWith(3, "1\tMocked label");
    expect(console.log).toHaveBeenCalledTimes(3);
  });

  it("should respect start option", async () => {
    await name({
      input: CLUSTERS_FIXTURE_PATH,
      start: "1",
      limit: "2",
    });

    expect(console.log).toHaveBeenNthCalledWith(1, "cluster_id\tlabel");
    expect(console.log).toHaveBeenNthCalledWith(2, "1\tMocked label");
    expect(console.log).toHaveBeenNthCalledWith(3, "2\tMocked label");
    expect(console.log).toHaveBeenCalledTimes(3);
  });

  it("should output total cost to stderr", async () => {
    await name({
      input: CLUSTERS_FIXTURE_PATH,
      limit: "1",
    });

    expect(console.error).toHaveBeenCalledWith("Total cost: $0.001000");
  });
});
