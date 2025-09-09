# Individual Tool Dockerfiles

Since each service is a separate tool, you might want individual Dockerfiles for specific deployment scenarios. Here are examples:

## Backend API Tool Dockerfile
```dockerfile
# tools-restructured/services/backend-api/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tools-restructured/services/backend-api/package*.json ./tools-restructured/services/backend-api/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY tools-restructured/services/backend-api/ ./tools-restructured/services/backend-api/

# Create non-root user
RUN addgroup --system --gid 1001 tooluser && \
    adduser --system --uid 1001 tooluser

USER tooluser

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:10000/health || exit 1

CMD ["node", "tools-restructured/services/backend-api/server.js"]
```

## AI Microservice Tool Dockerfile
```dockerfile
# tools-restructured/services/ai_microservice/Dockerfile
FROM node:18-alpine

# Install Python for potential AI libraries
RUN apk add --no-cache python3 py3-pip

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tools-restructured/services/ai_microservice/package*.json ./tools-restructured/services/ai_microservice/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY tools-restructured/services/ai_microservice/ ./tools-restructured/services/ai_microservice/

# Create non-root user
RUN addgroup --system --gid 1001 aiuser && \
    adduser --system --uid 1001 aiuser

USER aiuser

EXPOSE 10001

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:10001/health || exit 1

CMD ["node", "tools-restructured/services/ai_microservice/server.js"]
```

## Python Engine Tool Dockerfile
```dockerfile
# tools-restructured/services/python-engine/Dockerfile
FROM python:3.11-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache gcc musl-dev curl

# Copy requirements
COPY tools-restructured/services/python-engine/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY tools-restructured/services/python-engine/ ./

# Create non-root user
RUN addgroup --system --gid 1001 pyuser && \
    adduser --system --uid 1001 pyuser

USER pyuser

EXPOSE 10005

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:10005/health || exit 1

CMD ["python", "app.py"]
```

## Market Data Ingestion Tool Dockerfile
```dockerfile
# tools-restructured/services/market-data-ingestion/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tools-restructured/services/market-data-ingestion/package*.json ./tools-restructured/services/market-data-ingestion/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY tools-restructured/services/market-data-ingestion/ ./tools-restructured/services/market-data-ingestion/

# Create non-root user
RUN addgroup --system --gid 1001 datauser && \
    adduser --system --uid 1001 datauser

USER datauser

EXPOSE 10003

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:10003/health || exit 1

CMD ["node", "tools-restructured/services/market-data-ingestion/server.js"]
```

## Usage Instructions

### For Single Tool Deployment:
1. Place the specific Dockerfile in the tool's directory
2. Build: `docker build -t tool-name ./tools-restructured/services/tool-name`
3. Run: `docker run -p 10000:10000 tool-name`

### For Render Deployment:
1. Use the main Dockerfile with build args
2. Set `TOOL_NAME` environment variable in Render
3. Render will automatically handle the build process

### Build Arguments:
```bash
# Build specific tool
docker build --build-arg TOOL_NAME=backend-api -t backend-api-tool .
docker build --build-arg TOOL_NAME=ai_microservice -t ai-tool .
```

This approach gives you flexibility to:
- Deploy tools individually or together
- Use different base images if needed
- Optimize each tool's container
- Scale tools independently