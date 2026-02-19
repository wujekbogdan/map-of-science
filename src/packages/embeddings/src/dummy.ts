import type { EmbeddingResult, Embedder, TaskType } from "./types.js";

type DummyEmbedderParams = {
  dimension?: number;
};

/**
 * Dummy embedder for testing and as a template for new embedder implementations.
 */
export const createDummyEmbedder = (
  params: DummyEmbedderParams,
  type: TaskType,
): Embedder => {
  const dimension = params.dimension ?? 768;
  void type;

  return {
    embed: (text: string): Promise<EmbeddingResult> => {
      void text;
      const embedding = Array.from({ length: dimension }, () => 0.1);
      return Promise.resolve({ embedding });
    },
  };
};
