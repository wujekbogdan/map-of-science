import { z } from "zod";

export const sortValueSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("relevance") }),
  z.strictObject({
    kind: z.literal("articlesCount"),
    direction: z.enum(["asc", "desc"]),
  }),
]);

export type SortValue = z.infer<typeof sortValueSchema>;
