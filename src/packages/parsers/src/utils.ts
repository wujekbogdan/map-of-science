import { ZodType } from "zod";

export type Collector<Item, Result> = {
  add: (item: Item) => Result;
  getResults: () => Result;
};

export const validateWithSchema =
  <T>(schema: ZodType<T, unknown>) =>
  (data: unknown): T =>
    schema.parse(data);

export const createProcessor = <Item, Result>(
  schema: ZodType<Item, unknown>,
  collector: Collector<Item, Result>,
) => ({
  process: (data: unknown) => {
    const parsed = validateWithSchema(schema)(data);
    collector.add(parsed);
  },
  getResults: () => collector.getResults(),
});
