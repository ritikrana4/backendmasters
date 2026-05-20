export const content = {
  title: "Docker Architecture",
  sections: [
    {
      heading: "Client–Server Model",
      body: "Docker is built around a **client–server architecture**. The **Docker daemon** (`dockerd`) is the long-running background process that does all the heavy lifting: building images, managing containers, networks, and volumes. The **Docker CLI** (`docker`) is a thin client that sends commands to the daemon over a Unix socket (`/var/run/docker.sock`) or TCP.\n\nWhen you run `docker build` or `docker run`, you're sending an API request to the daemon — not doing the work in the CLI process itself. This separation is why you can run the CLI on one machine and point it at a remote daemon.",
      items: [
        "`dockerd` — the daemon. Listens on a Unix socket by default; can be configured for TCP with TLS for remote access.",
        "`docker` CLI — the client. Translates your commands into Docker Engine API (REST) calls.",
        "`Docker Desktop` — packages the daemon inside a lightweight Linux VM on Mac and Windows; proxies the socket.",
        "`Context` — a named connection profile. `docker context use remote` switches CLI to talk to a different daemon.",
        "`containerd` — the low-level container runtime that `dockerd` delegates to. Also used directly by Kubernetes.",
      ],
    },
    {
      heading: "Images & Layers",
      body: "A Docker **image** is a read-only template for containers. It's built as a stack of **layers** — each Dockerfile instruction that modifies the filesystem creates a new layer. Layers are content-addressed by SHA256 hash and stored once on disk even if shared by multiple images.\n\nWhen you run a container, Docker adds a thin writable **container layer** on top. All writes go to this layer; the image layers below remain unchanged. This means you can run 100 containers from the same image and they share the read-only image layers — only the per-container write layers consume additional disk.",
      code: `# Inspect image layers
docker image history nginx:alpine

# IMAGE          CREATED       CREATED BY                                SIZE
# abc123def456   2 weeks ago   CMD ["nginx" "-g" "daemon off;"]          0B
# <missing>      2 weeks ago   COPY nginx.conf /etc/nginx/nginx.conf     1.2kB
# <missing>      2 weeks ago   RUN apk add --no-cache nginx              7.1MB
# <missing>      3 weeks ago   FROM alpine:3.18                          7.3MB`,
      items: [
        "`Union filesystem` — overlays read-only image layers with a writable container layer (OverlayFS on modern Linux).",
        "`Layer cache` — during build, Docker reuses cached layers for unchanged instructions. An `ADD`/`COPY` that changes invalidates all subsequent layers.",
        "`Dangling images` — layers that are no longer referenced by any tag. Clean up with `docker image prune`.",
        "`Multi-platform images` — a single tag can hold variants for `linux/amd64` and `linux/arm64`. Use `docker buildx` to build and push manifests.",
      ],
    },
    {
      heading: "Container Runtime Stack",
      body: "Understanding the full runtime stack explains how containers actually start. Docker wraps several lower-level components:\n\n`dockerd` handles the Docker API. It delegates image management and container lifecycle to `containerd` (a CNCF project). `containerd` calls `runc` (an OCI-compliant runtime) to actually create the container — `runc` makes the Linux `clone()` syscalls to create namespaces and cgroups, then `exec`s the container process.\n\nKubernetes bypasses Docker entirely: it uses `containerd` directly via the CRI (Container Runtime Interface). This is why Docker was deprecated as a Kubernetes node runtime in v1.24.",
      items: [
        "`OCI (Open Container Initiative)` — open standards for image format and runtime. Images built with `docker build` are OCI-compliant and run on containerd, podman, or any OCI runtime.",
        "`runc` — the reference OCI runtime. Runs as a short-lived process that sets up namespaces, cgroups, and execs the container init process.",
        "`cgroups` — Linux kernel feature that limits CPU, memory, and I/O for a group of processes (the container).",
        "`namespaces` — Linux kernel feature that gives each container an isolated view of: PID tree, network stack, filesystem, hostname, and users.",
        "`Podman` — daemonless Docker alternative; containers run as child processes of the CLI, not a central daemon.",
      ],
    },
    {
      heading: "Docker Registries",
      body: "A **registry** stores and distributes Docker images. **Docker Hub** is the default public registry — `docker pull nginx` pulls from `registry-1.docker.io/library/nginx:latest`.\n\nFor production, use a **private registry**: AWS ECR (Elastic Container Registry), Google Artifact Registry, GitHub Container Registry, or self-hosted Harbor. Private registries provide access control, vulnerability scanning, and keep images within your network.",
      code: `# Pull from Docker Hub
docker pull postgres:16-alpine

# Tag your image for ECR
docker tag my-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-api:latest

# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 \\
  | docker login --username AWS --password-stdin \\
    123456789012.dkr.ecr.us-east-1.amazonaws.com

# Push
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-api:latest`,
      items: [
        "`Image reference` — `[registry/][namespace/]name[:tag][@digest]`. Missing registry defaults to Docker Hub.",
        "`Digest` — immutable SHA256 content hash, e.g., `nginx@sha256:abc...`. Pin to a digest in production for reproducibility.",
        "`Image scanning` — ECR, Harbor, and Docker Hub Pro scan images for CVEs using Trivy or Snyk.",
      ],
    },
  ],
};
