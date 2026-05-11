# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY tsconfig.base.json ./

# Copy package manifests (for dependency resolution)
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-events/package.json ./packages/shared-events/
COPY packages/shared-auth/package.json ./packages/shared-auth/

COPY apps/compendium-service/package.json ./apps/compendium-service/

# Install all deps (including dev for build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared-types/ ./packages/shared-types/
COPY packages/shared-utils/ ./packages/shared-utils/
COPY packages/shared-config/ ./packages/shared-config/
COPY packages/shared-events/ ./packages/shared-events/
COPY packages/shared-auth/ ./packages/shared-auth/
COPY apps/compendium-service/ ./apps/compendium-service/

# Build shared packages and then the service
RUN pnpm --filter @vtt/shared-types build
RUN pnpm --filter @vtt/shared-utils build
RUN pnpm --filter @vtt/shared-config build
RUN pnpm --filter @vtt/shared-auth build
RUN pnpm --filter @vtt/compendium-service build

# ─── Production stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Security: non-root user
RUN addgroup --system --gid 1001 vttgroup && \
    adduser --system --uid 1001 --ingroup vttgroup vttuser

WORKDIR /app

# Install dumb-init for signal handling
RUN apk add --no-cache dumb-init

# Copy built artifacts
COPY --from=builder --chown=vttuser:vttgroup /app/apps/compendium-service/dist ./dist
COPY --from=builder --chown=vttuser:vttgroup /app/node_modules ./node_modules
COPY --from=builder --chown=vttuser:vttgroup /app/apps/compendium-service/package.json ./

USER vttuser

EXPOSE 3040

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3040/health/ready || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
