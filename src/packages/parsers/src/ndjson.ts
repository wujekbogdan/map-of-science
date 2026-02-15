import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

export async function* streamNdjson(stream: NodeJS.ReadableStream) {
  const rl = createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (trimmed) {
      yield JSON.parse(trimmed);
    }
  }
}

export function streamNdjsonFile(filePath: string) {
  return streamNdjson(createReadStream(filePath, { encoding: "utf-8" }));
}
