import { z } from "zod";
import { type SortValue, sortValueSchema } from "./sortValue.ts";

const sortStringSchema = z.preprocess((raw) => {
  if (typeof raw !== "string") return null;
  const [kind, ...rest] = raw.split(".");
  return rest.length ? { kind, direction: rest.join(".") } : { kind };
}, sortValueSchema);

export const encodeSort = (value: SortValue): string =>
  "direction" in value ? `${value.kind}.${value.direction}` : value.kind;

export const decodeSort = (raw: unknown): SortValue | undefined =>
  sortStringSchema.safeParse(raw).data;
