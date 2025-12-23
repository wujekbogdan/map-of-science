import { createReadStream, type ReadStream } from "node:fs";
import StreamObject from "stream-json/streamers/StreamObject";

type StreamProvider = () => ReadStream;
type OnItem<Key, Value, Result> = (key: Key, value: Value) => Result;

export const parseJson = <Key extends string, Value, Result>(
  provider: StreamProvider,
  onItem: OnItem<Key, Value, Result>,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const pipeline = provider().pipe(StreamObject.withParser());

    pipeline.on("data", ({ key, value }: { key: Key; value: Value }) => {
      try {
        onItem(key, value);
      } catch (error) {
        pipeline.destroy();
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });

    pipeline.on("error", reject);
    pipeline.on("end", resolve);
  });

export const withFileStreamProvider = <Key extends string, Value, Result>(
  filePath: string,
  onItem: OnItem<Key, Value, Result>,
) => parseJson<Key, Value, Result>(() => createReadStream(filePath), onItem);
