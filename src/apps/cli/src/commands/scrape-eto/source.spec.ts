import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { dir as tmpDir } from "tmp-promise";
import { describe, expect, it } from "vitest";
import { resolveSourceFiles } from "./source.js";

const withTempDir = (run: (path: string) => Promise<void>) => async () => {
  const dir = await tmpDir({ unsafeCleanup: true });
  try {
    await run(dir.path);
  } finally {
    await dir.cleanup();
  }
};

describe("resolveSourceFiles", () => {
  it(
    "should return the path as-is when it points at a file",
    withTempDir(async (path) => {
      const file = join(path, "clusters.jsonl");
      await writeFile(file, "");

      expect(await resolveSourceFiles({ input: file })).toEqual([file]);
    }),
  );

  it(
    "should return a directory's .jsonl files sorted, ignoring other files",
    withTempDir(async (path) => {
      await writeFile(join(path, "shard_b.jsonl"), "");
      await writeFile(join(path, "shard_a.jsonl"), "");
      await writeFile(join(path, "notes.txt"), "");

      expect(await resolveSourceFiles({ input: path })).toEqual([
        join(path, "shard_a.jsonl"),
        join(path, "shard_b.jsonl"),
      ]);
    }),
  );

  it("should throw when the path does not exist", async () => {
    await expect(
      resolveSourceFiles({ input: "/nonexistent/clusters.jsonl" }),
    ).rejects.toThrow();
  });

  it(
    "should throw when the directory holds no .jsonl files",
    withTempDir(async (path) => {
      await writeFile(join(path, "notes.txt"), "");

      await expect(resolveSourceFiles({ input: path })).rejects.toThrow();
    }),
  );
});
