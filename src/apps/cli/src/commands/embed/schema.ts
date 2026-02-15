import { z } from "zod";

export const clusterDataSchema = z
  .object({
    id: z.number(),
    totalArticles: z.number(),
    articles: z.object({
      core: z.array(z.string()),
      review: z.array(z.string()),
      highlyCited: z.array(z.string()),
    }),
  })
  .transform((data) => ({
    id: String(data.id),
    totalArticles: data.totalArticles,
    titles: [
      ...new Set([
        ...data.articles.core,
        ...data.articles.review,
        ...data.articles.highlyCited,
      ]),
    ],
  }))
  .refine((data) => data.titles.length > 0, {
    message: "Cluster has no titles",
  });
