// import { dirname, resolve } from "node:path";
// import { fileURLToPath } from "node:url";
import { search } from "./qdrant.js";

// import { search, upsert } from "./qdrant.js";

// const resolvePath = (relativePath: string) => {
//   const here = dirname(fileURLToPath(import.meta.url));
//   return resolve(here, relativePath);
// };

// try {
//   const file = resolvePath("../assets/embeddings-1752005501427.tsv");
//   await upsert(file);
// } catch (error) {
//   console.error("Error during upsert:", error);
// }

try {
  const result = await search("photonics", 5);
  const response = result.map((item) => ({
    clusterId: item.id,
    concepts: item.concepts.map(({ concept }) => concept).join(", "),
  }));
  console.log(response);
} catch (error) {
  console.error("Error during search:", error);
}
