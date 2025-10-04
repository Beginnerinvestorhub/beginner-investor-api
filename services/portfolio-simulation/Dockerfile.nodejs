# syntax=docker/dockerfile:1.4

# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install build tools and pnpm
RUN apk add --no-cache python3 make g++ curl \
  && corepack enable \
  && corepack prepare pnpm@latest --activate

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source files and build the app
COPY tsconfig*.json ./
COPY src ./src
RUN pnpm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup -S nodejs && adduser -S portuser -G nodejs

# Copy built app and runtime dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.pnpm ./.pnpm

# Set ownership
RUN chown -R portuser:nodejs /app

USER portuser
EXPOSE 3004
CMD ["node", "dist/index.js"]
