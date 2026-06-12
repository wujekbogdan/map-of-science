FROM node:22.22.2-alpine3.22 AS base

FROM base AS pnpm
RUN apk update
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PNPM_HOME:$PATH"
RUN corepack enable

FROM pnpm AS pruner
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune @map-of-science/web --docker

FROM pnpm AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build

FROM nginx:1.27.2-alpine AS runner
COPY --from=builder /app/src/apps/web/dist /usr/share/nginx/html
# The stock entrypoint renders /etc/nginx/templates/*.template with envsubst
# at startup; the rendered config.js replaces the build-time stub.
COPY src/apps/web/config.js.template /etc/nginx/templates/config.js.template
ENV NGINX_ENVSUBST_OUTPUT_DIR=/usr/share/nginx/html
# envsubst leaves undefined vars as literal `${...}`, so default them to empty.
ENV VITE_API_URL=""
ENV VITE_DEV_TOOL_ENABLED=""
CMD ["nginx", "-g", "daemon off;"]
