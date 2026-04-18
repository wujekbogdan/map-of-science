import type { z } from "zod";

export const createDummyGenerator = (params: { response: unknown }) => ({
  generate: <TSchema extends z.ZodType>(generateParams: {
    prompt: string;
    schema: TSchema;
    temperature?: number;
  }): Promise<{
    object: z.infer<TSchema>;
    price: { raw: number; formatted: string };
  }> =>
    Promise.resolve().then(() => ({
      object: generateParams.schema.parse(params.response),
      price: { raw: 0, formatted: "$0.00" },
    })),
});
