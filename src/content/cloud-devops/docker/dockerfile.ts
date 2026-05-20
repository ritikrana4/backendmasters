export const content = {
  title: "Writing Dockerfiles",
  sections: [
    {
      heading: "Dockerfile Instructions",
      body: "A **Dockerfile** is a script of instructions that tells Docker how to build an image. Each instruction creates a layer (or modifies image metadata). The most important instructions:\n\n`FROM` sets the base image. `RUN` executes a shell command during build. `COPY` copies files from the build context into the image. `CMD` provides the default command to run when the container starts. `ENTRYPOINT` is the fixed executable; `CMD` becomes its arguments.",
      code: `# Python web API — production Dockerfile
FROM python:3.12-slim AS base

WORKDIR /app

# Install dependencies in a separate layer (cached if requirements.txt unchanged)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code (invalidates cache more often)
COPY src/ ./src/

# Non-root user for security
RUN adduser --disabled-password --gecos "" appuser
USER appuser

EXPOSE 8000

# CMD provides defaults; can be overridden at runtime
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
    },
    {
      heading: "Key Instructions Reference",
      body: "Each instruction has a specific purpose and affects the layer cache differently. Understanding the cache is critical — a changed instruction invalidates all subsequent layers, so order matters.",
      items: [
        "`FROM <image>[:<tag>]` — must be first. Use slim/alpine variants to minimise image size.",
        "`RUN <command>` — runs a command in a shell during build. Chain commands with `&&` to keep them in one layer and reduce image size.",
        "`COPY <src> <dest>` — copies files from the build context. Prefer `COPY` over `ADD` (no auto-extraction or URL fetching).",
        "`WORKDIR <path>` — sets the working directory for subsequent instructions. Creates the directory if it doesn't exist.",
        "`ENV <key>=<value>` — sets environment variables available at build time AND runtime.",
        "`ARG <name>[=default]` — build-time variables only; not available in the running container.",
        "`EXPOSE <port>` — documents which port the container listens on. Doesn't actually publish it — that's `-p` on `docker run`.",
        "`ENTRYPOINT` — the executable that runs. Combined with `CMD`: `ENTRYPOINT [\"python\"]` + `CMD [\"app.py\"]` → `python app.py`.",
        "`HEALTHCHECK` — tells Docker how to test if the container is healthy. Used by Compose and ECS.",
      ],
    },
    {
      heading: "Layer Caching Strategy",
      body: "Docker's build cache is one of the biggest performance levers. If an instruction and its inputs haven't changed since the last build, Docker reuses the cached layer instead of re-executing it. Once the cache is invalidated, all subsequent layers rebuild.\n\nThe rule: **put infrequently changing instructions at the top, frequently changing at the bottom**. Dependencies (requirements.txt, package.json) change less often than source code — copy and install them first, then copy source code.",
      code: `# SLOW build (copies all source first — cache busted on every source change)
COPY . .
RUN pip install -r requirements.txt  # re-runs on every code change!

# FAST build (installs deps first, source after)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt  # only re-runs if requirements.txt changes
COPY src/ ./src/

# Node.js equivalent
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY . .`,
      items: [
        "`--no-cache-dir` (pip) — don't store pip's download cache in the image layer (saves tens of MB).",
        "`npm ci` — deterministic install from lockfile. Faster than `npm install` and safer for production.",
        "`BuildKit` — enable with `DOCKER_BUILDKIT=1`. Parallel layer building, better caching, secrets mount, and SSH forwarding.",
        "`--mount=type=cache` — BuildKit secret: cache `/root/.cache/pip` across builds without embedding it in the image.",
      ],
    },
    {
      heading: ".dockerignore",
      body: "The `.dockerignore` file prevents files from being sent to the Docker build context. The **build context** is the entire directory you pass to `docker build .` — Docker tars it up and sends it to the daemon before building. Without `.dockerignore`, your 500 MB `node_modules` or `.git` folder is sent on every build.\n\nFormat is identical to `.gitignore`. Always create `.dockerignore` before writing a Dockerfile.",
      code: `# .dockerignore — always include these
.git
.gitignore
.env
.env.*
*.md
__pycache__/
*.pyc
*.pyo
.pytest_cache/
.coverage
htmlcov/
node_modules/
dist/
build/
.DS_Store
Dockerfile
docker-compose*.yml
.dockerignore`,
      items: [
        "A large build context slows every build — the entire context is uploaded to the daemon before layer processing starts.",
        "`.env` files with secrets must always be in `.dockerignore` — never in the image.",
        "Test files, docs, and CI config don't belong in production images.",
      ],
    },
  ],
};
