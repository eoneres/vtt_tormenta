FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-events/package.json ./packages/shared-events/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY apps/realtime-gateway-service/package.json ./apps/realtime-gateway-service/
RUN pnpm install --frozen-lockfile --filter @vtt/realtime-gateway-service...

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/realtime-gateway-service/ ./apps/realtime-gateway-service/
RUN pnpm --filter @vtt/shared-types build \
 && pnpm --filter @vtt/shared-events build \
 && pnpm --filter @vtt/shared-utils build \
 && pnpm --filter @vtt/realtime-gateway-service build

FROM node:20-alpine AS runner
RUN addgroup -S vtt && adduser -S vtt -G vtt
WORKDIR /app
COPY --from=builder --chown=vtt:vtt /app/apps/realtime-gateway-service/dist ./dist
COPY --from=builder --chown=vtt:vtt /app/node_modules ./node_modules
USER vtt
EXPOSE 2567
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:2567/health || exit 1
CMD ["node", "dist/main.js"]
