export const content = {
  title: "Environment & Secrets Management",
  sections: [
    {
      heading: "The 12-Factor App Config Model",
      body: `The **12-factor app** methodology (Heroku, 2011) defines how production-grade applications should handle configuration. Factor III: store config in the environment — separate from code. Anything that differs between environments (dev, staging, prod) is config and must not be hardcoded.`,
      items: [
        "**What is config**: database URLs, API keys, secrets, feature flags, port numbers — anything that varies by environment",
        "**What is not config**: code logic, HTML templates, SQL queries — these are code and belong in version control",
        "**Environment variables**: the standard mechanism. Available in every language. Set by the deployment platform, never in code.",
        "**Never commit secrets to git** — once a secret is in git history, it's compromised forever. Rotate it immediately.",
        "**Separate env per environment**: different keys for dev/staging/production. Never use prod credentials in dev.",
      ],
    },
    {
      heading: ".env Files",
      body: `**.env files** store environment variables for local development. They must **never** be committed to version control. Add \`.env\` to \`.gitignore\` immediately.`,
      code: `# .env (local dev only — NEVER commit)
DATABASE_URL=postgresql://postgres:password@localhost:5432/myapp_dev
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=dev-secret-not-for-production
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...

# .env.example (commit this — documents required variables)
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
STRIPE_SECRET_KEY=
OPENAI_API_KEY=

# .gitignore
.env
.env.local
.env.*.local

# Python: load .env with python-dotenv
from dotenv import load_dotenv
import os

load_dotenv()  # reads .env into os.environ

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is required")`,
    },
    {
      heading: "Secrets Managers",
      body: `In production, environment variables are injected by the platform (Kubernetes, ECS, Heroku). For sensitive secrets, use a **secrets manager** — encrypted storage with access logging, rotation, and fine-grained permissions.`,
      code: `# AWS Secrets Manager
import boto3, json

def get_secret(secret_name: str) -> dict:
    client = boto3.client("secretsmanager", region_name="us-east-1")
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response["SecretString"])

# Usage: fetch DB credentials at startup
secrets = get_secret("prod/myapp/database")
DATABASE_URL = (
    f"postgresql://{secrets['username']}:{secrets['password']}"
    f"@{secrets['host']}/{secrets['dbname']}"
)

# HashiCorp Vault (open source, self-hosted or cloud)
import hvac

client = hvac.Client(url="https://vault.example.com", token=os.getenv("VAULT_TOKEN"))
secret = client.secrets.kv.v2.read_secret_version(path="myapp/database")
creds = secret["data"]["data"]

# Kubernetes Secrets (injected as env vars or mounted files)
# deployment.yaml:
# env:
#   - name: DATABASE_URL
#     valueFrom:
#       secretKeyRef:
#         name: myapp-secrets
#         key: database-url`,
    },
    {
      heading: "Config Validation at Startup",
      body: `Validate all required config at application startup. Fail fast with a clear error rather than a cryptic crash minutes into a request.`,
      code: `# Pydantic Settings — type-safe config validation
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, RedisDsn, validator

class Settings(BaseSettings):
    # Required — app crashes at startup if missing
    database_url: PostgresDsn
    secret_key: str
    redis_url: RedisDsn

    # Optional with defaults
    debug: bool = False
    log_level: str = "INFO"
    max_connections: int = 10
    allowed_hosts: list[str] = ["*"]

    # Computed / validated fields
    @validator("secret_key")
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters")
        return v

    class Config:
        env_file = ".env"
        case_sensitive = False

# Singleton — load once at startup
settings = Settings()

# Accessing config throughout the app
from config import settings
db_url = settings.database_url

# FastAPI dependency injection
def get_settings() -> Settings:
    return settings`,
    },
    {
      heading: "Secret Rotation",
      body: `Secrets should be rotated regularly — and immediately after any potential exposure. A secret that never changes becomes an undetected compromise waiting to happen.`,
      items: [
        "**Automatic rotation**: AWS Secrets Manager can automatically rotate RDS passwords, Redis auth, and custom secrets on a schedule",
        "**Zero-downtime rotation**: store both the old and new secret during rotation. Workers pick up the new secret without restart.",
        "**Rotation triggers**: rotate all secrets immediately if: a team member leaves, a repository is accidentally made public, a machine is compromised",
        "**Audit logging**: secrets managers log every access — who/what accessed which secret and when. Essential for compliance and incident investigation.",
        "**API key hygiene**: use separate keys per environment (dev, staging, prod), per service, and per integration. Narrowly scope permissions. This limits blast radius when one key is leaked.",
        "**git-secrets / truffleHog**: run in CI to detect accidentally committed secrets before they reach the remote repository",
      ],
    },
  ],
};
