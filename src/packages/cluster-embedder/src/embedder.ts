type Article = {
  doi: string;
  title: string;
};

type ClusterInput = {
  id: string;
  researchFields: string;
  researchSubfields: string;
  keyConcepts: string;
  articleCount: number;
  articleAge: number;
  growthRating: number;
  articles: Article[];
};

type Work = {
  doi: string;
  title: string;
  abstract: string | null;
};

type EmbeddingResult = {
  embedding: number[];
};

type Dependencies = {
  fetchWorks: (dois: string[]) => Promise<Work[]>;
  embed: (text: string) => Promise<EmbeddingResult>;
  upsert: (params: {
    id: string;
    vectors: Record<string, number[]>;
    metadata: Record<string, unknown>;
  }) => Promise<{ id: string }>;
};

type Options = {
  maxArticles?: number;
};

const DEFAULT_MAX_ARTICLES = 10;

const buildArticlesText = (works: Work[]) =>
  works
    .map((work) =>
      work.abstract ? `${work.title}\n\n${work.abstract}` : work.title,
    )
    .join("\n\n\n");

const extractDois = (articles: Article[]) =>
  articles
    .map((article) => article.doi)
    .filter((doi) => doi.startsWith("https://doi.org/"));

const deduplicateDois = (dois: string[]) => [...new Set(dois)];

export const createClusterEmbedder =
  (deps: Dependencies) =>
  async (cluster: ClusterInput, options: Options = {}) => {
    const maxArticles = options.maxArticles ?? DEFAULT_MAX_ARTICLES;
    const allDois = deduplicateDois(extractDois(cluster.articles));
    const dois = allDois.slice(0, maxArticles);
    const works = await deps.fetchWorks(dois);
    const conceptsText = cluster.keyConcepts;
    const articlesText = buildArticlesText(works);
    const [conceptsEmbedding, articlesEmbedding] = await Promise.all([
      deps.embed(conceptsText),
      deps.embed(articlesText),
    ]);

    const result = await deps.upsert({
      id: cluster.id,
      vectors: {
        concepts: conceptsEmbedding.embedding,
        articles: articlesEmbedding.embedding,
      },
      metadata: {
        keyConcepts: cluster.keyConcepts,
        articleCount: cluster.articleCount,
        growthRating: cluster.growthRating,
        embedding: {
          articleCount: works.length,
          abstractCount: works.filter((work) => work.abstract !== null).length,
        },
      },
    });

    return { id: result.id };
  };
