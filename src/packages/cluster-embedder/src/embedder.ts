type ClusterInput = {
  id: string;
  titles: string[];
  totalArticles: number;
};

type EmbeddingResult = {
  embedding: number[];
};

type Dependencies = {
  embed: (text: string) => Promise<EmbeddingResult>;
  upsert: (params: {
    id: string;
    vectors: Record<string, number[]>;
    metadata: Record<string, unknown>;
  }) => Promise<{ id: string }>;
};

type Options = {
  maxTitles?: number;
};

const buildTitlesText = (titles: string[]) => titles.join("\n\n");

export const createClusterEmbedder =
  (deps: Dependencies) =>
  async (cluster: ClusterInput, options: Options = {}) => {
    const titles = options.maxTitles
      ? cluster.titles.slice(0, options.maxTitles)
      : cluster.titles;
    const titlesText = buildTitlesText(titles);
    const titlesEmbedding = await deps.embed(titlesText);

    const result = await deps.upsert({
      id: cluster.id,
      vectors: {
        titles: titlesEmbedding.embedding,
      },
      metadata: {
        clusterId: cluster.id,
        totalArticles: cluster.totalArticles,
        embedding: {
          titlesCount: titles.length,
        },
      },
    });

    return { id: result.id };
  };
