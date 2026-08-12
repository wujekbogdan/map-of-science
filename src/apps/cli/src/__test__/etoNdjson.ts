type Sections = {
  core?: string[];
  review?: string[];
  highlyCited?: string[];
};

const article = (title: string) => ({
  title,
  metadata: "2023: Journal of Tests",
  citations: 1,
  doi: null,
});

export const toEtoNdjson = (records: ({ id: number } & Sections)[]): string =>
  records
    .map(({ id, core = [], review = [], highlyCited = [] }) =>
      JSON.stringify({
        id,
        totalArticles: core.length + review.length + highlyCited.length,
        averageArticleAgeYears: 5.8,
        citationRatingPercentile: 75.47,
        patentRatingPercentile: 99.78,
        topJournals: ["Journal of Tests"],
        topInstitutions: ["Test University"],
        topCompanies: [],
        articles: {
          core: core.map(article),
          review: review.map(article),
          highlyCited: highlyCited.map(article),
        },
        relatedClusters: {
          topCiting: [{ id: 0, significantCitations: 3 }],
          topCited: [],
        },
      }),
    )
    .join("\n") + "\n";
