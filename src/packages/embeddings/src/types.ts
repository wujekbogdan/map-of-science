export type EmbeddingResult = {
  embedding: number[];
};

export type Embedder = {
  embed: (text: string) => Promise<EmbeddingResult>;
};

export type TaskType = "document" | "query";
