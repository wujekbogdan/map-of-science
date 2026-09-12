ARG NODE_VERSION=22.22.2
ARG NGINX_VERSION=1.27.2
ARG PACKAGE_NAME=@map-of-science/web
ARG APP_PATH=src/apps/web

FROM node:${NODE_VERSION}-alpine3.22 AS base

FROM base AS pnpm
RUN apk update
RUN apk add --no-cache libc6-compat
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

FROM nginxinc/nginx-unprivileged:${NGINX_VERSION}-alpine AS runner
ARG APP_PATH
USER root
COPY --from=builder /app/${APP_PATH}/dist /usr/share/nginx/html
COPY ${APP_PATH}/nginx.conf /etc/nginx/conf.d/default.conf
# At start the nginx entrypoint substitutes environment variables into every /etc/nginx/templates/*.template and writes the result to NGINX_ENVSUBST_OUTPUT_DIR.
# That turns this template into /usr/share/nginx/html/config.js and overwrites the empty stub the build produced, so one image serves any deployment.
COPY ${APP_PATH}/config.js.template /etc/nginx/templates/config.js.template
# The entrypoint writes the rendered file into this directory, so nginx needs write access to it.
RUN chown -R nginx:nginx /usr/share/nginx/html
USER nginx
ENV NGINX_ENVSUBST_OUTPUT_DIR=/usr/share/nginx/html
# envsubst leaves an undefined variable as a literal `${...}`, so default both to empty.
ENV VITE_API_URL=""
ENV VITE_DEV_TOOL_ENABLED=""

EXPOSE 8080
