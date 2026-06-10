import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

export const resolveSourceFiles = async ({ input }: { input: string }) => {
  const stats = await stat(input);

  if (stats.isFile()) {
    return [input];
  }

  const entries = await readdir(input);
  const files = entries
    .filter((entry) => entry.endsWith(".jsonl"))
    .sort()
    .map((entry) => join(input, entry));

  if (files.length === 0) {
    throw new Error(`No .jsonl files found in ${input}`);
  }

  return files;
};
