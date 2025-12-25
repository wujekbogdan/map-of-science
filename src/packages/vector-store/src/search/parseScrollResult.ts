import { pointSchema } from "./types.js";

export const parseScrollResult = (item: unknown) => {
  const parsed = pointSchema.parse(item);
  return { id: parsed.id, score: 1, metadata: parsed.payload };
};
