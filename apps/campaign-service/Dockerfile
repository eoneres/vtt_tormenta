FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@9
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/campaign-service/ ./apps/campaign-service/
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@vtt/campaign-service

FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm@9
COPY --from=builder /app/apps/campaign-service/dist ./dist
COPY --from=builder /app/apps/campaign-service/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3002/health || exit 1
CMD ["node", "dist/main"]
