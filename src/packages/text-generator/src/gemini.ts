import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import type { z } from "zod";
import { calculatePrice } from "@map-of-science/llm-price";

export const createGeminiGenerator = (params: {
  apiKey: string;
  model?: string;
}) => {
  const google = createGoogleGenerativeAI({
    apiKey: params.apiKey,
  });

  const modelName = params.model ?? "gemini-2.0-flash";
  const model = google(modelName);

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
        model: modelName,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
      });

      return {
        object,
        price: price.formatted,
      };
    },
  };
};
