import { ZodTypeDef, ZodSchema } from "zod";

export type Collector<Item, Result> = {
  add: (item: Item) => Result;
  getResults: () => Result;
};

export const validateWithSchema =
  <T>(schema: ZodSchema<T, ZodTypeDef, unknown>) =>
  (data: unknown): T =>
    schema.parse(data);

export const createProcessor = <Item, Result>(
  schema: ZodSchema<Item, ZodTypeDef, unknown>,
  collector: Collector<Item, Result>,
) => ({
  process: (data: unknown) => {
    const parsed = validateWithSchema(schema)(data);
    collector.add(parsed);
  },
  getResults: () => collector.getResults(),
});
