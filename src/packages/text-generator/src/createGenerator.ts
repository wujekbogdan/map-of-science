import { createDummyGenerator } from "./dummy.js";
import { createGeminiGenerator } from "./gemini.js";

type GeneratorConfig =
  | ({ provider: "gemini" } & Parameters<typeof createGeminiGenerator>[0])
  | ({ provider: "dummy" } & Parameters<typeof createDummyGenerator>[0]);

export const createGenerator = (config: GeneratorConfig) => {
  switch (config.provider) {
    case "gemini":
      return createGeminiGenerator(config);
    case "dummy":
      return createDummyGenerator(config);
  }
};
