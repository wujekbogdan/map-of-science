import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { upsert } from "./qdrant.js";

const resolvePath = (relativePath: string) => {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, relativePath);
};

try {
  const file = resolvePath("../assets/embeddings-1752005501427.tsv");
  await upsert(file);
} catch (error) {
  console.error("Error during upsert:", error);
}
