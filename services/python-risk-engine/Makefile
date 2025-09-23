.PHONY: build up down logs test lint format clean

# Build the containers
build:
	docker-compose build

# Start the services in detached mode
up:
	docker-compose up -d

# Stop and remove containers, networks
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Run tests
test:
	docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from test

# Lint the code
lint:
	docker-compose run --rm python-engine flake8 .
	docker-compose run --rm python-engine black --check .
	docker-compose run --rm python-engine isort --check-only .
	docker-compose run --rm python-engine mypy .

# Format the code
format:
	docker-compose run --rm python-engine black .
	docker-compose run --rm python-engine isort .

# Clean up containers, networks, and volumes
clean:
	docker-compose down -v
	docker-compose -f docker-compose.test.yml down -v

# Initialize the database
init-db:
	docker-compose exec postgres psql -U postgres -f /docker-entrypoint-initdb.d/init-db.sql

# Open a shell in the container
shell:
	docker-compose exec python-engine sh

# Run database migrations
migrate:
	docker-compose run --rm python-engine alembic upgrade head

# Create a new migration
migration:
	docker-compose run --rm python-engine alembic revision --autogenerate -m "$(m)"
