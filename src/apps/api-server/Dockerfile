ARG NODE_VERSION=22.22.2
ARG PACKAGE_NAME=@map-of-science/api-server
ARG APP_PATH=src/apps/api-server

FROM node:${NODE_VERSION}-slim AS base

FROM base AS pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PNPM_HOME:$PATH"
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

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=4 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.SERVER_PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# No ENV default for the port: the one default lives in the app config.
CMD ["sh", "-c", ": \"${SERVER_PORT:?SERVER_PORT must be set}\"; exec node index.mjs"]