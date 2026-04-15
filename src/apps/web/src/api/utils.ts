import { ZodType } from "zod";
import {
  arrayCollector,
  mapCollector,
  createProcessor,
  withHttpProvider,
} from "@map-of-science/parsers/browser";

type Options<T> = {
  url: string;
  schema: ZodType<T, unknown>;
};

export const loadAsArray = async <T>({ url, schema }: Options<T>) => {
  const collector = arrayCollector<T>();
  const processor = createProcessor(schema, collector);

  await withHttpProvider(url, processor.process);

  return processor.getResults();
};

export const loadAsMap = async <T, K>({
  url,
  schema,
  getKey,
}: Options<T> & { getKey: (item: T) => K }) => {
  const collector = mapCollector<K, T>(getKey);
  const processor = createProcessor(schema, collector);

  await withHttpProvider(url, processor.process);

  return processor.getResults();
};
