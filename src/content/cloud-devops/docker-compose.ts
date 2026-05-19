import type { DiagramConfig } from "@/components/FlowDiagram";

const composeDiagram: DiagramConfig = {
  width: 760,
  height: 220,
  caption: "Docker Compose multi-service app: Nginx proxies browser traffic to the web app, which reads from Redis and Postgres",
  nodes: [
    { id: "browser", type: "client",       label: "Browser",     x: 60,  y: 110 },
    { id: "nginx",   type: "loadbalancer", label: "Nginx",       sublabel: "proxy", x: 230, y: 110 },
    { id: "web",     type: "server",       label: "Web App",     x: 430, y: 110 },
    { id: "redis",   type: "cache",        label: "Redis",       sublabel: "cache", x: 620, y: 55  },
    { id: "db",      type: "database",     label: "Postgres",    x: 620, y: 180 },
  ],
  edges: [
    { from: "browser", to: "nginx", label: ":80" },
    { from: "nginx",   to: "web",   label: "proxy_pass" },
    { from: "web",     to: "redis", label: "sessions" },
    { from: "web",     to: "db",    label: "queries" },
  ],
};

export const content = {
  title: "Docker Compose",
  sections: [
    {
      heading: "Why Docker Compose",
      diagram: composeDiagram,
      body: `Real applications are never a single container. A typical web service needs a web server, an application server, a database, and a cache — each in its own container. Manually running four \`docker run\` commands with the right ports, volumes, networks, and environment variables is error-prone and hard to share with teammates.

**Docker Compose** solves this with a single YAML file (\`docker-compose.yml\`) that declares all your services, their configuration, and how they connect. One command — \`docker compose up\` — starts everything. One command — \`docker compose down\` — tears it all down cleanly.

Compose is designed for **local development and CI**. For production, you'd use Kubernetes or a managed container platform. But the same images you build with Compose deploy directly to Kubernetes — the workflow is consistent.`,
      items: [
        "`docker compose up -d` — start all services in the background",
        "`docker compose down` — stop and remove containers (volumes preserved by default)",
        "`docker compose logs -f web` — stream logs from the web service",
        "`docker compose exec web bash` — open a shell in the running web container",
        "`docker compose build` — rebuild images after Dockerfile changes",
      ],
    },
    {
      heading: "The docker-compose.yml File",
      body: `The Compose file has three top-level keys: \`services\` (the containers), \`volumes\` (persistent storage), and \`networks\` (virtual networks). Each service maps to a container. You specify either a \`build\` context (to build from a Dockerfile) or an \`image\` (to pull from a registry).

The \`depends_on\` key tells Compose the startup order. Note it only waits for the container to start, not for the application inside to be ready — use health checks for proper readiness gating. Environment variables can be inlined or loaded from a \`.env\` file.`,
      code: `# docker-compose.yml
version: "3.9"

services:
  nginx:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - web

  web:
    build: .                          # build from Dockerfile in current dir
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/myapp
      REDIS_URL: redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy    # wait until DB health check passes
      redis:
        condition: service_started

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data
    command: redis-server --appendonly yes   # enable persistence

volumes:
  pgdata:
  redisdata:`,
    },
    {
      heading: "Networking & Volumes",
      body: `Compose creates a **default bridge network** named after your project (e.g. \`myapp_default\`). Every service is automatically connected and can reach others by their **service name** as a hostname. The \`web\` service connects to Postgres at the hostname \`db\` — no IP addresses needed. This matches what you'd set in a \`DATABASE_URL\` environment variable.

**Volumes** decouple persistent data from container lifecycle. Named volumes (like \`pgdata\`) are managed by Docker and survive \`docker compose down\`. Bind mounts (like \`./nginx.conf:/etc/nginx/nginx.conf\`) map a host path into the container — great for config files and local development where you want live code reloading.

Use a \`.env\` file at the project root to keep secrets out of the YAML. Compose loads it automatically.`,
      code: `# .env file — never commit this to git
POSTGRES_PASSWORD=supersecret
SECRET_KEY=dev-only-key-change-in-prod

# Reference in docker-compose.yml
services:
  web:
    environment:
      SECRET_KEY: \${SECRET_KEY}
  db:
    environment:
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}

# Override for different environments (e.g. docker-compose.override.yml)
# docker compose -f docker-compose.yml -f docker-compose.prod.yml up

# Named network (explicit, useful for multi-compose setups)
networks:
  frontend:
  backend:

services:
  nginx:
    networks: [frontend, backend]
  web:
    networks: [backend]
  db:
    networks: [backend]     # DB not reachable from frontend network`,
    },
    {
      heading: "Common Commands",
      body: `Compose commands all operate on the services defined in your \`docker-compose.yml\`. By default they apply to all services; append a service name to target one. The \`--build\` flag forces image rebuilds even if Docker thinks nothing changed — useful after modifying a Dockerfile or base image.

Scaling a service (running multiple replicas) is possible with \`docker compose up --scale web=3\`, though for real horizontal scaling you'd move to Kubernetes. For local load testing it's a quick way to simulate multiple instances behind your Nginx proxy.`,
      code: `# Start everything, rebuild images if needed
docker compose up --build -d

# Tail logs from all services
docker compose logs -f

# Run a one-off command in the web service (e.g. DB migrations)
docker compose run --rm web python manage.py migrate

# Scale the web service to 3 replicas
docker compose up --scale web=3 -d

# Restart a single service after a code change
docker compose restart web

# Stop everything and remove containers + networks (keep volumes)
docker compose down

# Nuclear option: remove everything including volumes
docker compose down -v

# Check service health status
docker compose ps`,
    },
  ],
};
