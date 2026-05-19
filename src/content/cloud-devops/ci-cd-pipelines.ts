import type { DiagramConfig } from "@/components/FlowDiagram";

const cicdDiagram: DiagramConfig = {
  width: 760,
  height: 140,
  caption: "CI/CD pipeline: a git push triggers a runner that tests, builds a Docker image, pushes it to a registry, then deploys to production",
  nodes: [
    { id: "dev",      type: "client",       label: "Developer",     x: 55,  y: 70 },
    { id: "github",   type: "client",       label: "GitHub",        x: 185, y: 70 },
    { id: "runner",   type: "server",       label: "CI Runner",     x: 315, y: 70 },
    { id: "test",     type: "server",       label: "Test Stage",    x: 435, y: 70 },
    { id: "build",    type: "server",       label: "Build / Push",  x: 555, y: 70 },
    { id: "registry", type: "database",     label: "Registry",      x: 660, y: 70 },
  ],
  edges: [
    { from: "dev",      to: "github",   label: "git push" },
    { from: "github",   to: "runner",   label: "webhook" },
    { from: "runner",   to: "test",     label: "run" },
    { from: "test",     to: "build",    label: "pass" },
    { from: "build",    to: "registry", label: "image" },
  ],
};

export const content = {
  title: "CI/CD Pipelines",
  sections: [
    {
      heading: "The CI/CD Mindset",
      diagram: cicdDiagram,
      body: `**Continuous Integration (CI)** means every code change is automatically built and tested the moment it's pushed. The goal is to catch integration bugs within minutes rather than during a big-bang release at the end of a sprint. Small, frequent merges to the main branch reduce the cost of fixing bugs — a broken test on a 50-line PR is trivial to debug; a broken deploy from a week of unreviewed changes is a nightmare.

**Continuous Delivery (CD)** extends CI: every change that passes the automated pipeline is automatically deployable to production. **Continuous Deployment** goes one step further — every green commit is automatically deployed without human approval. Most teams use Continuous Delivery: the pipeline automates everything up to production, and a human clicks "deploy" (or a scheduled job does) when ready.

The cultural shift matters as much as the tooling: teams that practice CI/CD treat a broken pipeline as a P1 incident. No new work is merged until the pipeline is green.`,
      items: [
        "`CI` — automated build + test on every push; catches integration bugs fast",
        "`CD (Delivery)` — automated pipeline through staging; human approves production deploy",
        "`CD (Deployment)` — fully automated; every green commit goes to production",
        "`Pipeline-as-code` — the pipeline is a YAML file in the repo, versioned alongside the app",
        "`Artifact` — the immutable output of the build stage (Docker image, binary, .zip)",
      ],
    },
    {
      heading: "Pipeline Stages",
      body: `A well-designed pipeline runs the fastest, cheapest checks first and gates on failures: there's no point building a Docker image if the unit tests are broken.

**Lint & type-check** (< 30 s): static analysis catches syntax errors and type violations before running any code. **Unit tests** (< 2 min): test individual functions in isolation with mocked dependencies. **Integration tests** (2–10 min): spin up real services (database, cache) in Docker and test the full request path. **Build** (1–5 min): compile code, build the Docker image, tag it with the commit SHA. **Push** (< 1 min): push the image to the registry. **Deploy to staging** (1–3 min): roll out the new image to a staging environment. **Smoke tests**: hit a few key endpoints to verify the deployment is healthy. **Deploy to production**: either automatic or gated on a manual approval step.

Parallelise independent stages. Run lint and unit tests in parallel. Run integration tests in a separate job that starts after lint passes.`,
      code: `# Typical pipeline job dependencies
#
# push → [lint, unit-tests] → integration-tests → build → push-image
#      → deploy-staging → smoke-tests → deploy-prod (manual approval)
#
# Total time target: under 10 minutes to staging, under 15 to prod

# Fail fast strategy: if unit tests fail, don't waste time on integration tests
# Use caching aggressively: cache pip/npm installs, Docker layer cache`,
    },
    {
      heading: "GitHub Actions in Practice",
      body: `GitHub Actions defines pipelines as YAML files in \`.github/workflows/\`. A **workflow** is triggered by events (push, pull_request, schedule). A workflow contains **jobs** that run in parallel by default; use \`needs\` to create dependencies. Each job runs on a **runner** (a fresh VM) and contains **steps** — individual shell commands or reusable **actions** from the marketplace.

Docker layer caching is the biggest performance win for containerised builds. Use \`docker/build-push-action\` with \`cache-from: type=gha\` to cache layers in GitHub's cache store between runs.`,
      code: `# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip

      - run: pip install -r requirements.txt
      - run: ruff check .
      - run: mypy .
      - run: pytest --cov=src tests/
        env:
          DATABASE_URL: postgres://postgres:test@localhost/test

  build-and-push:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/\${{ github.repository }}:\${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production     # requires manual approval in GitHub UI
    steps:
      - run: |
          kubectl set image deployment/web \
            web=ghcr.io/\${{ github.repository }}:\${{ github.sha }} \
            -n production`,
    },
    {
      heading: "Deployment Strategies",
      body: `How you deploy matters as much as whether you deploy. Different strategies trade complexity against risk and downtime.

**Rolling update**: gradually replace old instances with new ones. Zero downtime, but both versions run simultaneously for a window — your app must tolerate this (avoid breaking DB schema changes). Kubernetes Deployments do this by default.

**Blue-green**: run two identical environments (blue = current, green = new). Switch the load balancer from blue to green in one atomic operation. Instant rollback: switch back to blue. Requires double the infrastructure during the transition.

**Canary**: route a small percentage of traffic (say, 5%) to the new version. Monitor error rates and latency. Gradually increase the percentage if metrics look healthy. Best risk management — production issues affect only a fraction of users.

**Feature flags**: deploy code to 100% of servers but enable the feature for a subset of users via a flag in your config. Decouple deployment from release — you can deploy any time, even before the feature is ready for users.`,
      code: `# Canary with Kubernetes and Argo Rollouts
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: web
spec:
  strategy:
    canary:
      steps:
      - setWeight: 5          # send 5% of traffic to new version
      - pause: {duration: 10m}
      - setWeight: 25
      - pause: {duration: 10m}
      - setWeight: 100        # fully roll out if no issues
      analysis:
        templates:
        - templateName: error-rate
        startingStep: 1
        args:
        - name: threshold
          value: "0.01"       # rollback if error rate > 1%`,
    },
  ],
};
