ARG NODE_VERSION=22.22.2
ARG PACKAGE_NAME=@map-of-science/api-server
ARG APP_PATH=src/apps/api-server

FROM node:${NODE_VERSION}-slim AS base

FROM base AS pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM pnpm AS pruner
ARG PACKAGE_NAME
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune ${PACKAGE_NAME} --docker

FROM pnpm AS builder
ARG PACKAGE_NAME
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=${PACKAGE_NAME}

FROM base AS runner
ARG APP_PATH
WORKDIR /app
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app

COPY --from=builder --chown=app:app /app/${APP_PATH}/dist/ ./

CMD ["node", "index.mjs"]