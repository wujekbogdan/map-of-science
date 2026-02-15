import { z } from "zod";

export const clusterSchema = z
  .object({
    id: z.number(),
    articles: z.object({
      core: z.array(z.string()),
      review: z.array(z.string()),
      highlyCited: z.array(z.string()),
    }),
  })
  .transform((data) => ({
    id: data.id,
    titles: [
      ...data.articles.core,
      ...data.articles.review,
      ...data.articles.highlyCited,
    ],
  }));
