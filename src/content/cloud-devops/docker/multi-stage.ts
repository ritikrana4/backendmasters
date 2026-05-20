export const content = {
  title: "Multi-stage Builds",
  sections: [
    {
      heading: "The Problem with Single-stage Builds",
      body: "To compile a Go binary, you need the Go compiler (hundreds of MB). But to run it, you only need the binary itself. In a single-stage Dockerfile, the compiler, build tools, test dependencies, and source code all end up in the final image — making it large and exposing unnecessary attack surface.\n\n**Multi-stage builds** solve this: you use multiple `FROM` instructions in a single Dockerfile. Each `FROM` starts a fresh stage. You compile in a **build stage** (with all tools), then `COPY --from=<stage>` only the compiled output into a minimal **production stage**. The build tools never reach the final image.",
      items: [
        "Single-stage Go image: 800 MB (includes Go toolchain, source code, and binaries).",
        "Multi-stage Go image: 8–20 MB (just the binary in a `scratch` or `alpine` base).",
        "Single-stage Node.js image: 1.2 GB with `devDependencies`. Multi-stage: 150 MB production-only.",
        "Attack surface is proportional to image size — smaller images have fewer packages with CVEs.",
      ],
    },
    {
      heading: "Multi-stage Dockerfile Patterns",
      body: "Name your stages with `AS <name>` for readability and to reference them in `COPY --from`. You can have as many stages as needed — only the last (or the one you target with `--target`) ends up as the final image.",
      code: `# Go multi-stage build
# Build stage
FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/api ./cmd/api

# Production stage — minimal image with just the binary
FROM scratch AS production
COPY --from=builder /bin/api /api
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
EXPOSE 8080
ENTRYPOINT ["/api"]

# Final image is ~8 MB instead of ~450 MB`,
    },
    {
      heading: "Node.js Multi-stage Build",
      body: "Node.js multi-stage builds separate the build/test stage (which needs `devDependencies`) from the production stage (which only needs the compiled output and `dependencies`).",
      code: `# Node.js / TypeScript multi-stage build
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build stage: compile TypeScript
FROM deps AS builder
COPY tsconfig.json .
COPY src/ ./src/
RUN npm run build      # outputs to /app/dist
RUN npm prune --production  # removes devDependencies from node_modules

# Production stage: only compiled JS + production deps
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["node", "dist/index.js"]`,
      items: [
        "`--from=<stage>` — copies from a previous named stage instead of the build context.",
        "`--from=<image>` — can also copy from any external image (e.g., `COPY --from=nginx:latest /etc/nginx /etc/nginx`).",
        "`npm prune --production` — removes `devDependencies` before copying node_modules to the production stage.",
        "`NODE_ENV=production` — tells Express and other frameworks to disable dev-only middleware and enable caching.",
      ],
    },
    {
      heading: "Targeting Stages & Development Builds",
      body: "Use `--target <stage>` to stop at a specific stage. This is powerful for development: your Dockerfile defines both a `dev` stage (with hot-reload, dev tools) and a `prod` stage. CI uses the default (prod); local development targets the dev stage.\n\nBuildKit (`DOCKER_BUILDKIT=1`) runs parallel stages and only builds stages required for the target, making multi-stage builds faster.",
      code: `# Dockerfile with dev and prod stages
FROM python:3.12-slim AS base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM base AS dev
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt
COPY . .
CMD ["uvicorn", "src.main:app", "--reload", "--host", "0.0.0.0"]

FROM base AS production
COPY src/ ./src/
RUN adduser --disabled-password appuser && chown -R appuser /app
USER appuser
CMD ["uvicorn", "src.main:app", "--workers", "4", "--host", "0.0.0.0"]

# Usage:
# docker build --target dev -t my-api:dev .   ← development
# docker build -t my-api:latest .              ← production (default last stage)`,
      items: [
        "`--target` — build only up to (and including) the named stage. Skips later stages.",
        "Docker Compose can use `target:` under `build:` to select a stage per service.",
        "`DOCKER_BUILDKIT=1 docker build` — parallel builds, better cache mounts, and secret mounts. Enabled by default in Docker 23+.",
      ],
    },
  ],
};
