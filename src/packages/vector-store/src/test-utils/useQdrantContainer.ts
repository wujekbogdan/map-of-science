import { GenericContainer, StartedTestContainer } from "testcontainers";
import { expect } from "vitest";

type Options = {
  port?: number;
};

type InitializedContainer = {
  container: StartedTestContainer;
  url: string;
  stop: () => Promise<void>;
};

export const useQdrantContainer = async ({
  port = 6333,
}: Options = {}): Promise<InitializedContainer> => {
  const container = await new GenericContainer("qdrant/qdrant:v1.16.0")
    .withExposedPorts(port)
    .start();

  const host = container.getHost();
  const mappedPort = container.getMappedPort(port);

  return {
    container,
    url: `http://${host}:${mappedPort}`,
    stop: async () => {
      await container.stop();
    },
  };
};

export type Qdrant = Awaited<ReturnType<typeof useQdrantContainer>>;
export type Test = (qdrant: Qdrant) => Promise<void>;
export type Params = Parameters<typeof useQdrantContainer>[0];

export const withQdrantContainer =
  (test: Test, params?: Params) => async () => {
    const qdrant = await useQdrantContainer(params);
    try {
      expect.hasAssertions();
      await test(qdrant);
    } finally {
      await qdrant.stop();
    }
  };
