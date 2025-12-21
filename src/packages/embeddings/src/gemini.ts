import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embed } from "ai";
import type { EmbeddingResult, Embedder, TaskType } from "./types.js";

type GeminiEmbedderParams = {
  apiKey: string;
  dimension?: number;
};

export const createGeminiEmbedder = (
  params: GeminiEmbedderParams,
  type: TaskType,
): Embedder => {
  const google = createGoogleGenerativeAI({
    apiKey: params.apiKey,
  });

  const embeddingModel = google.textEmbeddingModel("gemini-embedding-001");

  return {
    embed: async (text: string): Promise<EmbeddingResult> => {
      const taskType =
        type === "document" ? "RETRIEVAL_DOCUMENT" : "RETRIEVAL_QUERY";
      const { embedding } = await embed({
        model: embeddingModel,
        value: text,
        providerOptions: {
          google: {
            outputDimensionality: params.dimension ?? 768,
            taskType: taskType,
          },
        },
      });

      return {
        embedding,
      };
    },
  };
};
