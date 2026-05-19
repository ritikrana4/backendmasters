export const content = {
  title: "Database Migrations",
  sections: [
    {
      heading: "What are Migrations?",
      body: `A **database migration** is a versioned, incremental change to the database schema — adding a column, creating a table, renaming an index. Migrations replace ad-hoc \`ALTER TABLE\` commands run manually with a repeatable, auditable history. They're the database equivalent of git commits: every change is tracked, ordered, and reversible.`,
      items: [
        "**Up migration** — applies the change (creates table, adds column)",
        "**Down migration** — reverses the change (drops table, removes column)",
        "**Migration file** — a numbered file (001_create_users.sql, 002_add_email_index.sql) applied in order",
        "**Migration table** — the migration tool creates a table in your database to track which migrations have been applied",
        "**Never edit a migration** that has already been applied in production — always create a new one",
      ],
    },
    {
      heading: "Migration Tools",
      body: `Every major language ecosystem has migration tools. The concepts are identical; only the syntax differs.`,
      code: `# Python — Alembic (SQLAlchemy) or Django migrations

# Django: auto-generates migrations from model changes
python manage.py makemigrations   # detect changes and generate files
python manage.py migrate          # apply pending migrations
python manage.py migrate --fake   # mark as applied without running (for syncing)

# Alembic (used with FastAPI/SQLAlchemy)
alembic revision --autogenerate -m "add email index"  # generate from models
alembic upgrade head               # apply all pending
alembic downgrade -1               # revert last migration
alembic history                    # show all migrations and status

# JavaScript/Node — Knex.js or Prisma migrate
npx knex migrate:make add_email_column
npx knex migrate:latest
npx knex migrate:rollback

npx prisma migrate dev --name add_email_column
npx prisma migrate deploy   # production: apply pending

# Go — golang-migrate
migrate -path ./migrations -database postgres://... up
migrate -path ./migrations -database postgres://... down 1

# Java — Flyway or Liquibase
# Flyway: SQL files named V1__create_users.sql, V2__add_email_index.sql
# Automatically applied in version order on startup`,
    },
    {
      heading: "Writing Safe Migrations",
      body: `Running migrations on a live production database without downtime requires care. Some operations lock the table and block all reads/writes for the duration.`,
      code: `-- ✅ SAFE: Adding a nullable column (instant, no lock)
ALTER TABLE users ADD COLUMN bio TEXT;

-- ✅ SAFE: Adding a column with a constant default (Postgres 11+)
ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE;
-- Before Postgres 11: this rewrote every row → use nullable first, then backfill

-- ✅ SAFE: Creating an index CONCURRENTLY (no table lock)
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
-- Takes longer but doesn't block reads/writes

-- ⚠ DANGEROUS: Adding a NOT NULL column without default (rewrites table)
ALTER TABLE orders ADD COLUMN processed_at TIMESTAMPTZ NOT NULL;
-- Blocks all reads and writes until done — may take minutes on large tables

-- Safe multi-step approach for adding NOT NULL column:
-- Step 1: Add nullable column (instant)
ALTER TABLE orders ADD COLUMN processed_at TIMESTAMPTZ;
-- Step 2: Backfill existing rows (batched to avoid lock)
UPDATE orders SET processed_at = created_at WHERE processed_at IS NULL;
-- Step 3: Add NOT NULL constraint
ALTER TABLE orders ALTER COLUMN processed_at SET NOT NULL;

-- ⚠ DANGEROUS: Renaming a column (breaks deployed app code)
-- Safe approach: add new column, copy data, update code, drop old column

-- ⚠ DANGEROUS: Creating a regular index on a large table
-- Use CREATE INDEX CONCURRENTLY instead`,
    },
    {
      heading: "Zero-Downtime Migration Patterns",
      body: `Deploying schema changes without downtime requires coordination between database changes and application code deployments.`,
      items: [
        "**Expand-contract pattern**: first deploy makes schema backward-compatible (add new column), then deploy updates app to use new column, then deploy removes old column",
        "**Add before remove**: never rename a column directly. Add the new column, copy data, update the app, then drop the old column in a separate deployment",
        "**Feature flags**: hide new behavior behind a flag while the migration runs, then enable it",
        "**Backfill in batches**: updating millions of rows at once locks the table. Use `WHERE id BETWEEN X AND Y` in a loop with small batches and short sleeps",
        "**Never DROP a column in the same deploy as the code that stops using it** — deploy the code change first, confirm it's working, then drop the column in the next deploy",
      ],
      code: `# Batched backfill in Python (safe for large tables)
import time
import psycopg2

BATCH_SIZE = 1000
conn = psycopg2.connect(dsn)
cursor = conn.cursor()

last_id = 0
while True:
    cursor.execute("""
        UPDATE orders
        SET processed_at = created_at
        WHERE processed_at IS NULL
          AND id > %s
          AND id <= %s + %s
        RETURNING id
    """, [last_id, last_id, BATCH_SIZE])

    rows = cursor.fetchall()
    conn.commit()

    if not rows:
        break

    last_id = max(r[0] for r in rows)
    print(f"Backfilled up to id {last_id}")
    time.sleep(0.1)   # brief pause to reduce load`,
    },
  ],
};
