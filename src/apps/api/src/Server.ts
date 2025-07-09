import Fastify from "fastify";
import { z, flattenError } from "zod/v4";
import { search } from "./qdrant.js";

type Config = {
  port: number;
  host: string;
};

const SearchRequestSchema = z.object({
  query: z.object({
    query: z.string(),
    limit: z.coerce.number().min(1).max(100).default(10),
  }),
});

export const Server = async ({ port, host }: Config) => {
  const server = Fastify();
  server.get("/clusters", async (request, reply) => {
    const { success, error, data } = SearchRequestSchema.safeParse(request);

    if (!success) {
      return reply.code(400).send({ error: flattenError(error) });
    }

    try {
      const { query, limit } = data.query;
      reply.send(await search(query, limit));
    } catch (err) {
      const msg = "Unknown error";
      console.error(err, msg);
      reply.code(500).send({ error: msg });
    }
  });

  await server.listen({ port, host });
  console.info("Server started on port", port);

  return {
    stop: () => server.close(),
  };
};
