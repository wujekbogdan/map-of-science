import { createDummyEmbedder } from "./dummy.js";
import { createGeminiEmbedder } from "./gemini.js";
import type { TaskType } from "./types.js";

type EmbedderConfig =
  | ({ provider: "gemini" } & Parameters<typeof createGeminiEmbedder>[0])
  | ({ provider: "dummy" } & Parameters<typeof createDummyEmbedder>[0]);

export const createEmbedder = (config: EmbedderConfig, type: TaskType) => {
  switch (config.provider) {
    case "gemini":
      return createGeminiEmbedder(config, type);
    case "dummy":
      return createDummyEmbedder(config, type);
  }
};
