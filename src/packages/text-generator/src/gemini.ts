import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import type { z } from "zod";
import { calculatePrice } from "@map-of-science/llm-price";

export const createGeminiGenerator = (config: {
  apiKey: string;
  model: string;
}) => {
  const google = createGoogleGenerativeAI({
    apiKey: config.apiKey,
  });

  const model = google(config.model);

  return {
    generate: async <TSchema extends z.ZodType>(params: {
      prompt: string;
      schema: TSchema;
      temperature?: number;
    }) => {
      const { object, usage } = await generateObject({
        model,
        schema: params.schema,
        prompt: params.prompt,
        temperature: params.temperature ?? 0,
      });

      const price = calculatePrice({
        model: config.model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
      });

      return {
        object,
        price,
      };
    },
  };
};
