import { z } from "zod";

export const clusterSchema = z
  .object({
    Articles: z.array(z.object({ Title: z.string() })),
  })
  .transform((data) => ({
    titles: data.Articles.map((article) => article.Title),
  }));
