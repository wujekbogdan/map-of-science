import { createReadStream } from "node:fs";
import StreamObject from "stream-json/streamers/StreamObject";

export async function* streamJson<Key extends string, Value>(
  stream: NodeJS.ReadableStream,
): AsyncGenerator<{ key: Key; value: Value }> {
  const pipeline = stream.pipe(StreamObject.withParser());

  for await (const item of pipeline) {
    yield item;
  }
}

export function streamJsonFile<Key extends string, Value>(
  filePath: string,
): AsyncGenerator<{ key: Key; value: Value }> {
  return streamJson<Key, Value>(createReadStream(filePath));
}
