export const content = {
  title: "Containerization with Docker",
  sections: [
    {
      heading: "Why Docker?",
      body: `**Docker** packages your application and all its dependencies into a **container** — a lightweight, portable, isolated unit that runs identically everywhere. "Works on my machine" becomes "works everywhere". Containers are the foundation of modern deployment: Kubernetes, ECS, Cloud Run, and Fly.io all run containers.`,
      items: [
        "**Image** — a read-only snapshot: your code, runtime, dependencies, config. Built from a Dockerfile.",
        "**Container** — a running instance of an image. Isolated process with its own filesystem, network, and resources.",
        "**Registry** — where images are stored: Docker Hub, AWS ECR, GitHub Container Registry (ghcr.io)",
        "**Immutable deploys** — each release is a new image tag. Roll back by deploying the previous tag.",
        "**Isolation** — containers don't interfere with each other or the host. Run Python 3.9 and 3.12 on the same machine.",
      ],
    },
    {
      heading: "Writing a Dockerfile",
      body: `A **Dockerfile** is a recipe for building an image. Each instruction creates a layer. Layers are cached — if the layer hasn't changed, Docker reuses the cache instead of rebuilding.`,
      code: `# Dockerfile for a FastAPI application

# Base image — official Python slim (smaller than full image)
FROM python:3.12-slim

# Set working directory inside container
WORKDIR /app

# Copy dependency files FIRST (cache optimization)
# This layer only rebuilds if requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (this layer rebuilds on every code change)
COPY . .

# Create non-root user for security
RUN useradd -m appuser
USER appuser

# Expose port (documentation — doesn't actually publish it)
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Build image
# docker build -t myapp:1.0 .

# Run container
# docker run -p 8000:8000 --env-file .env myapp:1.0`,
    },
    {
      heading: "Multi-Stage Builds",
      body: `**Multi-stage builds** use multiple FROM statements. Each stage is a separate environment. You can copy only the built artifacts from a build stage into a minimal final image — keeping images small and build tools out of production.`,
      code: `# Multi-stage Dockerfile: build → production

# Stage 1: builder (has build tools, compilers)
FROM python:3.12 AS builder

WORKDIR /build
COPY requirements.txt .
# Install dependencies into a specific directory
RUN pip install --prefix=/install --no-cache-dir -r requirements.txt

# Stage 2: production (minimal runtime image)
FROM python:3.12-slim AS production

# Copy only the installed packages from builder
COPY --from=builder /install /usr/local

WORKDIR /app
COPY . .

RUN useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Result: production image has no pip, no build tools — only the runtime
# Typical size reduction: 800MB → 150MB

# .dockerignore (like .gitignore — excludes files from build context)
# .env
# .git
# __pycache__
# *.pyc
# tests/
# docs/`,
    },
    {
      heading: "Docker Compose",
      body: `**Docker Compose** defines and runs multi-container applications with a single YAML file. Essential for local development — spin up your app, database, Redis, and other services with one command.`,
      code: `# docker-compose.yml
version: "3.9"

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379/0
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - .:/app    # mount code for hot reload in dev

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:

# Commands:
# docker compose up -d          # start all services
# docker compose logs -f api    # follow logs
# docker compose exec api bash  # shell into container
# docker compose down           # stop and remove containers`,
    },
    {
      heading: "Container Best Practices",
      body: `Production containers need to be secure, minimal, and observable.`,
      items: [
        "**Run as non-root**: create a dedicated user in the Dockerfile. Root in a container can still escape to the host in some configurations.",
        "**Pin base image versions**: `FROM python:3.12.3-slim` not `FROM python:latest`. Unpinned tags break builds randomly.",
        "**One process per container**: don't run nginx + app + worker in one container. Use Compose or Kubernetes for multi-process setups.",
        "**Immutable infrastructure**: don't SSH into a container to change it. Rebuild and redeploy a new image.",
        "**Health checks**: add a `HEALTHCHECK` instruction so Docker knows when your container is ready, and replaces it if it becomes unhealthy.",
        "**Secrets at runtime**: never bake secrets into images. Pass them via environment variables, secrets managers, or mounted secret files.",
        "**Scan for vulnerabilities**: use `docker scout`, Trivy, or Snyk to scan images for known CVEs before deploying.",
      ],
    },
  ],
};
