export const content = {
  title: "Container Security",
  sections: [
    {
      heading: "Run as Non-Root",
      body: "By default, processes inside a Docker container run as **root (UID 0)**. This is dangerous: if an attacker exploits your application, they have root inside the container. While containers are isolated from the host, root inside a container can still cause serious damage — write to mounted volumes, exploit kernel vulnerabilities, escape via misconfigured `--privileged` flags.\n\nAlways create and use a dedicated non-root user in your Dockerfile. Most security scanners (Trivy, Snyk, GitHub Security) flag root containers as HIGH severity.",
      code: `# Dockerfile — run as non-root
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

# Create a dedicated user with no shell and no home directory
RUN addgroup --system appgroup && \\
    adduser --system --ingroup appgroup --no-create-home appuser

# Change ownership of app files to the new user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
      items: [
        "`USER <uid>` — use a numeric UID (e.g., `USER 1001`) instead of a username for compatibility with Kubernetes security contexts.",
        "Alpine's `adduser -S` creates a system user without a password or shell; preferred for containers.",
        "`--no-new-privileges` — Docker run flag that prevents the process from gaining new privileges via setuid binaries.",
        "Kubernetes `runAsNonRoot: true` in `securityContext` enforces this at the cluster level regardless of Dockerfile.",
      ],
    },
    {
      heading: "Image Scanning & Vulnerability Management",
      body: "Container images aggregate the vulnerabilities of every OS package and library they include. A `python:3.12` image may contain dozens of packages from the underlying Debian/Alpine OS, each with their own CVE history. **Image scanning** detects known vulnerabilities (CVEs) in packages, libraries, and language dependencies.\n\n**Trivy** is the most popular open-source scanner. It scans the image filesystem, identifies installed packages, and checks them against the NVD and vendor advisories. Integrate it into your CI pipeline to catch vulnerabilities before images reach production.",
      code: `# Install Trivy and scan an image
brew install aquasecurity/trivy/trivy
trivy image nginx:latest

# Scan and fail CI if HIGH or CRITICAL vulnerabilities are found
trivy image --exit-code 1 --severity HIGH,CRITICAL my-api:latest

# Scan a Dockerfile before building
trivy config Dockerfile

# GitHub Actions integration
- name: Scan image for vulnerabilities
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: my-api:GIT_SHA   # e.g. github.sha in Actions
    format: sarif
    output: trivy-results.sarif
    severity: HIGH,CRITICAL
    exit-code: 1

- name: Upload to GitHub Security tab
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: trivy-results.sarif`,
      items: [
        "`Trivy` — scans images, filesystems, repos, IaC configs. Free and fast.",
        "`Snyk` — commercial scanner with deeper analysis, licence scanning, and PR checks.",
        "`ECR Image Scanning` — uses Inspector v2; auto-scans on push and sends findings to Security Hub.",
        "Use minimal base images (Alpine, Distroless) to reduce the number of packages that can have CVEs.",
        "`google/distroless` — base images with no shell, package manager, or OS utilities. Only the language runtime. Minimal attack surface.",
      ],
    },
    {
      heading: "Secrets Management",
      body: "Never put secrets (passwords, API keys, tokens) in Dockerfiles or image layers. Even if you `RUN rm secret.txt`, the secret persists in the layer that created it — `docker history` or layer extraction can recover it.\n\nThe correct approach: inject secrets at **runtime** via environment variables from a secrets manager, or mount them as files via Docker secrets or Kubernetes secrets volumes.",
      code: `# WRONG — secret baked into image layer
RUN echo "DB_PASS=supersecret" > /app/.env  # NEVER do this

# CORRECT 1 — environment variable at runtime
docker run -e DB_PASSWORD="$(aws secretsmanager get-secret-value ...)" my-api

# CORRECT 2 — BuildKit secret mount (available only during build, never in image)
# syntax=docker/dockerfile:1
RUN --mount=type=secret,id=npm_token \\
    NPM_TOKEN=$(cat /run/secrets/npm_token) npm install

# docker build --secret id=npm_token,src=$HOME/.npmrc .

# CORRECT 3 — Docker Compose with .env file (never commit .env to git)
# docker-compose.yml
services:
  api:
    env_file:
      - .env   # Docker reads this file; variables are NOT baked into the image`,
      items: [
        "`docker secret` — Docker Swarm's native secrets; mounted as in-memory tmpfs files inside containers.",
        "`Kubernetes secrets` — base64-encoded (not encrypted) by default; use Sealed Secrets or External Secrets Operator for encryption at rest.",
        "`--mount=type=secret` — BuildKit feature that injects secrets only during `RUN`, never stored in any layer.",
        "Always add `.env` and all credential files to `.dockerignore` and `.gitignore`.",
      ],
    },
    {
      heading: "Read-only Filesystems & Linux Capabilities",
      body: "Two more hardening techniques significantly reduce the blast radius if a container is compromised:\n\n**Read-only root filesystem** (`--read-only`) mounts the container's root filesystem as read-only. Malware can't install itself or modify binaries. If your app needs to write temp files, mount a specific `tmpfs` for `/tmp` and named volumes for persistent data.\n\n**Capabilities** — Linux root is split into ~40 granular capabilities (e.g., `CAP_NET_BIND_SERVICE` to bind ports < 1024). Docker drops most capabilities by default. Drop all remaining ones with `--cap-drop=ALL` and add back only what's needed.",
      code: `# Run with read-only filesystem + minimal capabilities
docker run \\
  --read-only \\
  --tmpfs /tmp:rw,noexec,nosuid,size=100m \\
  --cap-drop=ALL \\
  --cap-add=NET_BIND_SERVICE \\   # only if binding port 80/443
  --security-opt no-new-privileges:true \\
  my-api:latest

# docker-compose.yml equivalent
services:
  api:
    image: my-api:latest
    read_only: true
    tmpfs:
      - /tmp
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true`,
      items: [
        "`--read-only` — mounts container root filesystem as read-only. Best practice for all production containers.",
        "`--cap-drop=ALL --cap-add=NET_BIND_SERVICE` — zero-capabilities baseline; add back only what your app actually needs.",
        "`seccomp` — system call filtering profile that blocks unnecessary syscalls. Docker ships with a default seccomp profile; use `--security-opt seccomp=<profile.json>` to customise.",
        "`AppArmor` — mandatory access control profiles for containers on Linux. Docker applies a default profile; tighten it per-container.",
      ],
    },
  ],
};
