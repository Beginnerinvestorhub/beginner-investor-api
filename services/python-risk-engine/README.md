# Python Engine Service

AI-powered backend service for processing and generating insights using machine learning models.

## Features

- 🚀 FastAPI-based REST API
- 🔒 Secure authentication and authorization
- 🗄️ PostgreSQL database integration
- 🔄 Redis caching and rate limiting
- 🤖 AI/ML model serving
- 📊 Prometheus metrics and monitoring
- 📝 OpenAPI documentation

## Prerequisites

- Python 3.10+
- Docker and Docker Compose
- PostgreSQL
- Redis
- Poetry (for development)

## Getting Started

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Update the `.env` file with your configuration.

### Installation

1. Install dependencies with Poetry:
   ```bash
   poetry install
   ```

### Running the Service

#### Development

```bash
# Start the development server
uvicorn app.main:app --reload
```

#### Production

```bash
# Build the Docker image
docker build -t python-engine .

# Run with Docker Compose
docker-compose up -d
```

## API Documentation

Once the service is running, access the following URLs:

- API Documentation: http://localhost:5000/docs
- ReDoc Documentation: http://localhost:5000/redoc
- Health Check: http://localhost:5000/health
- Metrics: http://localhost:5000/metrics

## Development

### Code Style

We use `black` for code formatting and `isort` for import sorting:

```bash
# Format code
black .

# Sort imports
isort .
```

### Testing

Run tests with coverage:

```bash
pytest --cov=app --cov-report=term-missing
```

### Linting

```bash
# Run flake8
flake8

# Run mypy
mypy .
```

## Deployment

### Docker

```bash
# Build the image
docker build -t python-engine .

# Run the container
docker run -d --name python-engine -p 5000:5000 --env-file .env python-engine
```

### Kubernetes

See the `kubernetes/` directory for deployment manifests.

## Monitoring

The service exposes Prometheus metrics at `/metrics`. Configure your monitoring system to scrape this endpoint.

## License

MIT
