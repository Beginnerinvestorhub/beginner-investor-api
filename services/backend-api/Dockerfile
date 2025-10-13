# syntax=docker/dockerfile:1.4

# Base image with pnpm setup
FROM node:20-alpine AS base

# Install pnpm globally as fallback
RUN npm install -g pnpm@latest

WORKDIR /app

# Stage 1: Install production dependencies
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Stage 2: Full build with dev dependencies
FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY tsconfig*.json ./
COPY src ./src
RUN pnpm run build

# Stage 3: Final runtime image
FROM node:20-alpine AS runner

# Create non-root user
RUN addgroup --system nodejs && adduser --system --ingroup nodejs nextjs

WORKDIR /app

# Copy built artifacts and production deps
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json pnpm-lock.yaml ./

# Set proper ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
