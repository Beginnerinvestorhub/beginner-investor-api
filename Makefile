# Makefile
.PHONY: dev prod build logs test health clean format lint

# Development
dev:
	cd infrastructure/docker && docker-compose -f docker-compose.yml -f docker-compose-dev.yml up

prod:
	cd infrastructure/docker && docker-compose up -d

build:
	cd infrastructure/docker && docker-compose build

logs:
	cd infrastructure/docker && docker-compose logs -f

# Testing
test:
	python -m pytest tests/

# Code Quality
format:
	black .
	isort .

lint:
	flake8 .
	mypy .

# Maintenance
health:
	./scripts/health-check.sh

clean:
	cd infrastructure/docker && docker-compose down -v
	docker system prune -f