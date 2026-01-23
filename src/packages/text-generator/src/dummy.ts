import type { z } from "zod";

export const createDummyGenerator = (params: { response: unknown }) => ({
  generate: <TSchema extends z.ZodType>(generateParams: {
    prompt: string;
    schema: TSchema;
    temperature?: number;
  }) => ({
    object: generateParams.schema.parse(params.response),
    price: "$0.00",
  }),
});
