import type { DiagramConfig } from "@/components/FlowDiagram";

const dockerDiagram: DiagramConfig = {
  width: 760,
  height: 160,
  caption: "Docker lifecycle: source code is built into an image, then run as an isolated container that exposes a port to the user",
  nodes: [
    { id: "dev",       type: "client",       label: "Dev Machine",    x: 60,  y: 80 },
    { id: "build",     type: "server",       label: "docker build",   x: 210, y: 80 },
    { id: "image",     type: "database",     label: "Docker Image",   x: 380, y: 80 },
    { id: "container", type: "server",       label: "Container",      x: 550, y: 80 },
    { id: "user",      type: "client",       label: "User / Browser", x: 700, y: 80 },
  ],
  edges: [
    { from: "dev",       to: "build",     label: "Dockerfile" },
    { from: "build",     to: "image",     label: "layers" },
    { from: "image",     to: "container", label: "docker run" },
    { from: "container", to: "user",      label: ":8080" },
  ],
};

export const content = {
  title: "Containers & Docker",
  sections: [
    {
      heading: "Containers vs Virtual Machines",
      diagram: dockerDiagram,
      body: `A **container** is a lightweight, isolated process that shares the host OS kernel. A **virtual machine** (VM) runs a full OS on virtualised hardware. The practical difference is dramatic: a VM image is gigabytes and takes minutes to boot; a container image can be under 50 MB and starts in milliseconds.

Containers achieve isolation through two Linux kernel primitives: **namespaces** (each container gets its own view of the filesystem, network, processes, and users) and **cgroups** (limit how much CPU, memory, and I/O a container can consume). Docker is the tooling that makes these primitives user-friendly.

The key tradeoff: containers share the host kernel, so a Linux container cannot run natively on Windows without a lightweight VM layer (Docker Desktop handles this transparently on Mac/Windows). VMs offer stronger isolation — useful for multi-tenant infrastructure where different customers share the same hardware.`,
      items: [
        "`Container` — shares host kernel, starts in ~100 ms, image is MBs, slight isolation",
        "`VM` — full guest OS, starts in minutes, image is GBs, strong isolation",
        "`Container runtime` — the low-level tool (containerd, runc) that actually runs containers; Docker wraps this",
        "`OCI image` — the open standard for container images; Docker images follow this spec, so they run on Kubernetes too",
      ],
    },
    {
      heading: "Docker Architecture & Workflow",
      body: `Docker has a client–server architecture. The **Docker daemon** (\`dockerd\`) runs as a background service on your machine and does all the heavy lifting: building images, managing containers, handling networking and volumes. The **Docker CLI** (\`docker\`) is the client you type commands into — it talks to the daemon over a Unix socket.

Images are stored in a **registry**. Docker Hub is the public default; companies run private registries (AWS ECR, GitHub Container Registry, Harbor). When you run \`docker pull nginx\`, the daemon downloads layers from the registry and caches them locally. Layers are content-addressed (SHA256), so if two images share a base layer it's only stored once.

The build context is the directory you pass to \`docker build\`. Docker sends the entire context to the daemon, so keep it small — use a \`.dockerignore\` file to exclude \`node_modules\`, \`.git\`, test data, etc.`,
      code: `# Check daemon is running
docker info

# Pull an image from Docker Hub
docker pull python:3.12-slim

# List locally cached images
docker images

# Run a container interactively
docker run -it python:3.12-slim bash

# Run in background (detached), map port 8080→80, give it a name
docker run -d -p 8080:80 --name myapp nginx

# List running containers
docker ps

# View logs
docker logs myapp

# Stop and remove
docker stop myapp && docker rm myapp`,
    },
    {
      heading: "Writing a Dockerfile",
      body: `A **Dockerfile** is a text recipe for building an image. Each instruction creates a new layer. Docker caches layers that haven't changed, so order matters: put instructions that change rarely (installing OS packages) before instructions that change often (copying your source code). This keeps rebuilds fast.

The \`FROM\` instruction sets the base image. Always prefer official slim or alpine variants in production (\`python:3.12-slim\` vs \`python:3.12\`) — they're dramatically smaller and have a smaller attack surface. Use multi-stage builds to keep the final image lean: build in one stage with all the dev tools, copy only the compiled artefact into a minimal runtime stage.`,
      code: `# ---- Stage 1: build ----
FROM python:3.12-slim AS builder

WORKDIR /app

# Copy dependency manifest first — cached until requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source after dependencies (cache busts less often)
COPY . .

# ---- Stage 2: runtime ----
FROM python:3.12-slim

WORKDIR /app

# Copy installed packages from builder stage
COPY --from=builder /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY --from=builder /app .

# Run as non-root user — security best practice
RUN useradd -m appuser
USER appuser

# Document which port the app listens on (informational only)
EXPOSE 8000

# Default command to run when the container starts
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
    },
    {
      heading: "Essential Docker Commands",
      body: `Beyond the basics, a few commands unlock the most productive Docker workflows. \`docker exec\` lets you open a shell inside a running container for debugging without restarting it. \`docker volume\` manages persistent storage — data in a container's filesystem is lost when the container is removed, so databases and uploads must use volumes. \`docker network\` manages isolated virtual networks; containers on the same network resolve each other by name.`,
      code: `# --- Images ---
docker build -t myapp:1.0 .          # build image tagged myapp:1.0
docker tag myapp:1.0 ghcr.io/org/myapp:1.0
docker push ghcr.io/org/myapp:1.0    # push to GitHub Container Registry

# --- Debugging ---
docker exec -it myapp bash           # shell into running container
docker inspect myapp                 # full JSON metadata
docker stats                         # live CPU/memory usage

# --- Volumes ---
docker volume create pgdata
docker run -d \
  -v pgdata:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret \
  postgres:16

# --- Networks ---
docker network create backend-net
docker run -d --name db --network backend-net postgres:16
docker run -d --name web --network backend-net myapp:1.0
# 'web' container can reach 'db' at hostname 'db'

# --- Cleanup ---
docker system prune -f               # remove stopped containers, dangling images`,
    },
  ],
};
