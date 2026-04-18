type ClusterInput = {
  titles: string[];
};

type EmbeddingResult = {
  embedding: number[];
};

type Dependencies = {
  embed: (text: string) => Promise<EmbeddingResult>;
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
    const { embedding } = await deps.embed(buildTitlesText(titles));

    return { vector: embedding };
  };
