# Build stage
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Only copy package files first to leverage layer caching
COPY package*.json ./

# Install all dependencies with a clean slate
RUN rm -rf node_modules && \
    npm cache clean --force && \
    npm ci

# Copy source code
COPY tsconfig*.json ./
COPY src ./src

# Build the application
RUN npm run build

# Install production dependencies
RUN rm -rf node_modules && \
    npm ci --only=production

# Production stage
FROM node:20-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache curl

WORKDIR /app

# Create app user
RUN addgroup -S nodejs && \
    adduser -S nextjs -G nodejs && \
    chown -R nextjs:nodejs /app

# Copy built files from builder
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Use non-root user
USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
