import { z } from "zod";

const articleSchema = z.object({
  DOI: z.string(),
  Title: z.string(),
});

export const clusterDataSchema = z
  .object({
    "Research fields": z.string(),
    "Research subfields": z.string(),
    "Key concepts": z.string(),
    "Number of articles": z.number(),
    "Article age": z.number(),
    "Growth rating": z.number(),
    Articles: z.array(articleSchema),
  })
  .transform((data) => ({
    researchFields: data["Research fields"],
    researchSubfields: data["Research subfields"],
    keyConcepts: data["Key concepts"],
    articleCount: data["Number of articles"],
    articleAge: data["Article age"],
    growthRating: data["Growth rating"],
    articles: data.Articles.map((article) => ({
      doi: article.DOI,
      title: article.Title,
    })),
  }));
