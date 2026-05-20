export const content = {
  title: "Registry & Image Management",
  sections: [
    {
      heading: "Docker Hub & Public Registries",
      body: "A **container registry** is a versioned store for Docker images. **Docker Hub** (`hub.docker.com`) is the default public registry — `docker pull nginx` implicitly pulls from `registry-1.docker.io/library/nginx:latest`. Official images (Postgres, Python, Node.js) are maintained by Docker and the upstream projects.\n\nOther public registries: **GitHub Container Registry** (ghcr.io), **Google Artifact Registry** (us-docker.pkg.dev), **Quay.io**. Each has its own naming scheme and authentication.",
      items: [
        "`docker.io/library/nginx:latest` — fully qualified Docker Hub official image. `nginx:latest` is shorthand.",
        "`docker.io/myuser/my-app:v1.2.3` — user or organisation image on Docker Hub.",
        "`ghcr.io/myorg/api:sha-abc123` — GitHub Container Registry image with a Git SHA tag.",
        "`123456789012.dkr.ecr.us-east-1.amazonaws.com/api:latest` — AWS ECR private registry.",
        "Docker Hub rate-limits unauthenticated pulls (100/6h per IP). Always authenticate in CI pipelines.",
      ],
    },
    {
      heading: "Tagging Strategy",
      body: "A Docker image **tag** is a mutable label pointing to an image digest. Tags are how you version and identify images. `latest` is just a convention — it's not automatically the newest image unless you explicitly push to it.\n\nA solid production tagging strategy provides immutability for rollbacks, traceability to the source commit, and clarity about what's in production.",
      code: `# Tagging strategy for CI/CD:
# 1. Tag with git SHA — immutable, traceable to exact commit
docker build -t registry/api:git-$(git rev-parse --short HEAD) .

# 2. Tag with semantic version on release
docker tag registry/api:git-abc1234 registry/api:v2.3.1
docker tag registry/api:git-abc1234 registry/api:v2.3
docker tag registry/api:git-abc1234 registry/api:latest

# 3. Push all tags
docker push registry/api:git-abc1234
docker push registry/api:v2.3.1
docker push registry/api:v2.3
docker push registry/api:latest

# Pin to digest in production for true immutability
# docker pull registry/api@sha256:8f3c...  (never changes even if tag is re-pushed)`,
      items: [
        "`latest` — useful for development and local pulls but unreliable in production. Always pin to a specific tag or digest.",
        "`git-<sha>` — immutable link to the exact code that built the image. Best for production deployments.",
        "`<semver>` — human-readable version. Float `v1.2` to the latest patch; pin `v1.2.3` to a specific build.",
        "`sha256:<digest>` — true immutability. The only guarantee that the image hasn't changed.",
      ],
    },
    {
      heading: "AWS ECR — Elastic Container Registry",
      body: "**ECR** is AWS's managed private container registry. It integrates with IAM for access control, supports vulnerability scanning, runs inside your VPC (no public internet needed from ECS/EKS), and has lifecycle policies to auto-delete old images.\n\nECR uses short-lived tokens for authentication — the `ecr get-login-password` command returns a 12-hour token that you pipe into `docker login`. CI systems typically do this at the start of each build.",
      code: `# Authenticate Docker to ECR (runs in CI or locally)
aws ecr get-login-password --region us-east-1 \\
  | docker login \\
    --username AWS \\
    --password-stdin \\
    123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build, tag, and push
docker build -t my-api .
docker tag my-api:latest \\
  123456789012.dkr.ecr.us-east-1.amazonaws.com/my-api:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-api:latest

# ECR lifecycle policy — keep last 10 images, delete older ones
aws ecr put-lifecycle-policy \\
  --repository-name my-api \\
  --lifecycle-policy-text '{
    "rules": [{
      "rulePriority": 1,
      "selection": {"tagStatus": "any", "countType": "imageCountMoreThan", "countNumber": 10},
      "action": {"type": "expire"}
    }]
  }'`,
      items: [
        "`ECR Public` — a free public registry (gallery.ecr.aws) for sharing images publicly.",
        "`ECR image scanning` — integrates with Inspector v2 for CVE scanning on push. Alerts on HIGH/CRITICAL vulnerabilities.",
        "`Cross-account push` — grant another AWS account access via a repository policy (not IAM policy).",
        "`VPC endpoint for ECR` — pull images from ECS/EKS without NAT Gateway by adding Interface VPC endpoints for ECR.",
      ],
    },
    {
      heading: "GitHub Actions — Build & Push Pipeline",
      body: "The most common pattern in modern CI/CD is a GitHub Actions workflow that builds and pushes images on every push to main (or on a release tag). Using the official `docker/build-push-action` provides BuildKit, multi-platform builds, and layer caching.",
      code: `# .github/workflows/build.yml
name: Build & Push

on:
  push:
    branches: [main]
  release:
    types: [published]

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # for OIDC auth to AWS
      contents: read

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials (OIDC — no long-lived keys)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions
          aws-region: us-east-1

      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: |
            REGISTRY/api:latest
            REGISTRY/api:git-SHA
          # where REGISTRY = steps.login-ecr.outputs.registry
          # and SHA = github.sha
          cache-from: type=gha
          cache-to: type=gha,mode=max`,
      items: [
        "`OIDC auth` — GitHub Actions can assume an IAM role via OpenID Connect, eliminating the need for long-lived AWS access keys in GitHub secrets.",
        "`cache-from: type=gha` — caches image layers in GitHub's Actions cache between runs, dramatically speeding up builds.",
        "`docker/metadata-action` — automatically generates tags and labels from git metadata (branch, tag, SHA).",
      ],
    },
  ],
};
