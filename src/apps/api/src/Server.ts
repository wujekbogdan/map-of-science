import cors from "@fastify/cors";
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
    limit: z.coerce.number().min(1).max(1000).default(100),
    scoreThreshold: z.coerce.number().min(0).max(1).default(0.5),
  }),
});

export const Server = async ({ port, host }: Config) => {
  const server = Fastify();
  server.register(cors, {
    origin: "*",
  });
  server.get("/clusters", async (request, reply) => {
    const { success, error, data } = SearchRequestSchema.safeParse(request);

    if (!success) {
      return reply.code(400).send({ error: flattenError(error) });
    }

    try {
      console.info("Search request:", data.query);
      reply.send(await search(data.query));
    } catch (err) {
      const msg = "Unknown error";
      console.error(err, msg);
      reply.code(500).send({ error: msg });
    }
  });

  await server.listen({ port, host });
  console.info(`Server listening on ${host}:${port}`);

  return {
    stop: () => server.close(),
  };
};
