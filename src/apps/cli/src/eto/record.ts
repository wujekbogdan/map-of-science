import { z } from "zod";
import type { ParsedCluster } from "@map-of-science/eto-cluster-parser";

// The schemas take their types from `ParsedCluster`.
// A change to the parser then stops the build, and does not make all records fail at run time.
type ParsedArticle = ParsedCluster["articles"]["core"][number];

const articleTitleSchema: z.ZodType<Pick<ParsedArticle, "title">> = z.object({
  title: z.string(),
});

const articleSchema: z.ZodType<ParsedArticle> = z.object({
  title: z.string(),
  metadata: z.string(),
  citations: z.number(),
  doi: z.string().nullable(),
});

const relatedClusterSchema: z.ZodType<
  ParsedCluster["relatedClusters"]["topCiting"][number]
> = z.object({
  id: z.number(),
  significantCitations: z.number(),
});

const articleSections = <Article extends Pick<ParsedArticle, "title">>(
  schema: z.ZodType<Article>,
) =>
  z.object({
    core: z.array(schema),
    review: z.array(schema),
    highlyCited: z.array(schema),
  });

const titlesOf = (articles: {
  core: Pick<ParsedArticle, "title">[];
  review: Pick<ParsedArticle, "title">[];
  highlyCited: Pick<ParsedArticle, "title">[];
}) =>
  [...articles.core, ...articles.review, ...articles.highlyCited].map(
    ({ title }) => title,
  );

export const etoTitlesSchema = z
  .object({
    id: z.number(),
    articles: articleSections(articleTitleSchema),
  })
  .transform(({ id, articles }) => ({ id, titles: titlesOf(articles) }));

export const etoRecordSchema = z
  .object({
    id: z.number(),
    averageArticleAgeYears: z.number(),
    citationRatingPercentile: z.number(),
    patentRatingPercentile: z.number(),
    topJournals: z.array(z.string()),
    topInstitutions: z.array(z.string()),
    topCompanies: z.array(z.string()),
    articles: articleSections(articleSchema),
    relatedClusters: z.object({
      topCiting: z.array(relatedClusterSchema),
      topCited: z.array(relatedClusterSchema),
    }),
  })
  .transform((record) => ({ ...record, titles: titlesOf(record.articles) }));

export type EtoRecord = z.output<typeof etoRecordSchema>;
