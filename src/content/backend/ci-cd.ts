export const content = {
  title: "CI/CD & Deployment",
  sections: [
    {
      heading: "What is CI/CD?",
      body: `**CI (Continuous Integration)** automatically builds and tests every code change. **CD (Continuous Delivery/Deployment)** automatically delivers tested code to production (or staging). Together, they eliminate manual, error-prone release processes and enable teams to ship multiple times per day with confidence.`,
      items: [
        "**CI pipeline**: triggered on every push/PR → lint → type check → run tests → build Docker image",
        "**CD pipeline**: triggered on merge to main → push image to registry → deploy to staging → (gate) → deploy to production",
        "**Continuous Delivery**: automated up to production gate, humans approve production deploy",
        "**Continuous Deployment**: fully automated — every green main branch commit goes to production",
        "**Tools**: GitHub Actions (most common), GitLab CI, CircleCI, Jenkins, ArgoCD",
      ],
    },
    {
      heading: "GitHub Actions Pipeline",
      body: `A complete CI/CD pipeline using GitHub Actions — the most widely used platform.`,
      code: `# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: testdb
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: pip-\${{ hashFiles('requirements.txt') }}

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Lint
        run: ruff check .

      - name: Type check
        run: mypy .

      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/testdb
        run: pytest --cov=app --cov-report=xml

  build:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/myorg/myapp:\${{ github.sha }}`,
    },
    {
      heading: "Deployment Strategies",
      body: `How you replace old versions with new ones matters. Different strategies offer different trade-offs between risk, downtime, and resource cost.`,
      items: [
        "**Rolling deploy** — gradually replace old instances with new ones. No downtime, low risk, easy to observe. Default in Kubernetes.",
        "**Blue-green** — maintain two identical environments (blue=live, green=new). Switch traffic instantly, instant rollback by switching back. Doubles resource cost during deploy.",
        "**Canary release** — route a small percentage of traffic (1%, 5%) to the new version. Watch metrics. Gradually increase or roll back. Best for high-traffic, risk-sensitive changes.",
        "**Feature flags** — deploy code to production but hide it behind a flag. Decouple deployment from feature release. Control exposure by user segment.",
        "**Recreate** — stop all old instances, start all new. Causes downtime. Only acceptable for non-critical or batch services.",
      ],
      code: `# Kubernetes rolling deploy strategy
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1   # at most 1 pod down during deploy
      maxSurge: 1         # at most 1 extra pod during deploy

# Blue-green with Kubernetes service selector
kubectl patch service myapp -p '{"spec":{"selector":{"version":"green"}}}'
# All traffic instantly switches to green. Roll back:
kubectl patch service myapp -p '{"spec":{"selector":{"version":"blue"}}}'`,
    },
    {
      heading: "Environments",
      body: `Production deployments should pass through multiple environments with progressively less tolerance for failure.`,
      items: [
        "**Development** — local machine. Uses docker-compose, local database, hot reload.",
        "**CI** — ephemeral, created per PR. Runs automated tests. Uses test databases, no real external services.",
        "**Staging** — mirrors production as closely as possible. Real infrastructure, real service integrations (Stripe test mode, etc.). Used for manual QA and smoke tests.",
        "**Production** — live traffic. Protected by branch policies, deploy gates, and feature flags.",
        "**Environment parity**: keep environments as similar as possible. Differences between staging and prod cause bugs that only appear in production.",
        "**Ephemeral environments (review apps)**: create a full deployed environment per PR. Merge → auto-destroy. Heroku, Railway, and Render support this natively.",
      ],
    },
    {
      heading: "Rollbacks",
      body: `Every deploy must have a defined rollback strategy. Bad deploys happen — the question is how fast you can recover.`,
      items: [
        "**Image-based rollback**: Docker images are immutable with tags. Rolling back is just deploying the previous image tag: `kubectl set image deploy/myapp app=ghcr.io/org/myapp:v1.2.3`",
        "**Database migrations**: always write forward-compatible migrations. New code and old code should both work during the transition window.",
        "**Canary rollback**: route canary percentage back to 0% if metrics degrade. Zero-downtime rollback.",
        "**Feature flag rollback**: instantly disable a feature by toggling a flag — no deploy needed.",
        "**Define SLOs**: know your error rate and latency thresholds. Automatic rollback when thresholds are breached (Argo Rollouts supports this).",
        "**Practice rollbacks**: run rollback drills. If you've never practiced it, you won't do it smoothly when there's a production incident.",
      ],
    },
  ],
};
