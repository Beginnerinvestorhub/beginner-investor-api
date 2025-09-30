# syntax=docker/dockerfile:1.4

# Base image with pnpm setup
FROM node:20-slim@sha256:d38efce970505168e50665d2350ae7d102204235d7072a1076afbdf227c1ea17 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Stage 1: Install production dependencies with cache
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile --prod

# Stage 2: Full build with dev dependencies
FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile
COPY tsconfig*.json ./
COPY src ./src
RUN pnpm run build

# Stage 3: Final runtime image
FROM node:20-slim@sha256:d38efce970505168e50665d2350ae7d102204235d7072a1076afbdf227c1ea17 AS runner

# Create non-root user
RUN addgroup --system nodejs && adduser --system --ingroup nodejs nextjs

WORKDIR /app

# Copy built artifacts and production deps
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json pnpm-lock.yaml ./

USER nextjs
EXPOSE 3000
CMD ["node", "dist/index.js"]
