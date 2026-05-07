FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile --filter @vtt/frontend...

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/frontend/ ./apps/frontend/
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @vtt/shared-types build \
 && pnpm --filter @vtt/shared-utils build \
 && pnpm --filter @vtt/frontend build

FROM node:20-alpine AS runner
RUN addgroup -S vtt && adduser -S vtt -G vtt
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder --chown=vtt:vtt /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=vtt:vtt /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder --chown=vtt:vtt /app/apps/frontend/public ./apps/frontend/public
USER vtt
EXPOSE 3010
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3010/api/health || exit 1
CMD ["node", "apps/frontend/server.js"]
