FROM node:22.15.0-slim AS base

FROM base AS pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM pnpm AS pruner
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune @map-of-science/api --docker

FROM pnpm AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build
# `pnpm prune` does not recursively remove node_modules in a monorepo, so as a workaround we use `rimraf` to remove all
# node_modules directories and re-run `pnpm install`, but now with the `--prod` flag. This replicates the behavior of
# `pnpm prune --prod`
RUN npx --yes rimraf --glob "**/node_modules"
RUN pnpm install --prod
# If I had a bundler. I would do it differently - I would change the WORKDIR and prune just the `@my-namespace/my-app`

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app

COPY --from=builder --chown=app:app  /app/node_modules ./node_modules
# If Docker supported wildcard COPY, I would do:
#  `COPY --from=builder /app/src/apps/**/dist ./src/apps`
#  `COPY --from=builder /app/src/apps/**/node_modules ./src/apps`
#  `COPY --from=builder /app/src/packages/**/dist ./src/packages`
#  `COPY --from=builder /app/src/packages/**/node_modules ./src/packages`
# But instead, for simplicity, I copy entire directories
COPY --from=builder --chown=app:app  /app/src/apps ./src/apps
COPY --from=builder --chown=app:app  /app/src/packages ./src/packages
# TODO: The above COPY commands copied too much - not only `dist` and `node_modules`, but also the source code.
# To fix this, I could either write a cleanup script, use selective per-package copying, or add a bundler.

CMD ["node", "src/apps/api/dist/index.js"]