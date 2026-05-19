export const content = {
  title: "Connection Pooling & Performance",
  sections: [
    {
      heading: "Why Connection Pooling?",
      body: `Opening a database connection is expensive — it involves a TCP handshake, TLS negotiation, authentication, and process/memory allocation on the server. If your app opens a new connection per request, you're adding 20–100ms of latency to every request and likely crashing your database under load. **Connection pooling** maintains a pool of pre-opened connections that requests borrow and return.`,
      items: [
        "**Without pooling**: each API request opens a connection → 100 concurrent requests = 100 DB connections. PostgreSQL starts struggling at ~200 connections.",
        "**With pooling**: 100 requests share 10 connections. Requests queue if all connections are busy.",
        "**Application-level pools** — managed by your application process: SQLAlchemy, pg, asyncpg, HikariCP",
        "**External pool proxies** — PgBouncer, Pgpool-II. Sit in front of Postgres and multiplex thousands of client connections onto a small number of server connections.",
        "PostgreSQL's `max_connections` defaults to 100. In production this is often raised to 200–500, but each idle connection consumes ~5–10MB of RAM.",
      ],
    },
    {
      heading: "PgBouncer — External Connection Pooler",
      body: `**PgBouncer** is the standard connection pooler for PostgreSQL. It runs as a lightweight proxy between your app and Postgres, multiplexing many app connections onto fewer server connections.`,
      code: `# PgBouncer config (pgbouncer.ini)
[databases]
myapp = host=db.example.com port=5432 dbname=myapp

[pgbouncer]
listen_port = 6432
listen_addr = *

# Pool modes:
# transaction: connection returned after each transaction (most efficient, recommended)
# session: connection held for full session (safe for all features, less efficient)
# statement: connection returned after each statement (can't use transactions)
pool_mode = transaction

max_client_conn = 1000    # max clients connecting to PgBouncer
default_pool_size = 20    # connections to actual Postgres per database/user

# App connects to PgBouncer port (6432), not Postgres directly (5432)
DATABASE_URL=postgresql://user:pass@localhost:6432/myapp

# Limitations of transaction mode:
# ✗ SET LOCAL doesn't persist across statements
# ✗ Named prepared statements don't work
# ✗ Advisory locks don't work
# ✗ LISTEN/NOTIFY doesn't work`,
    },
    {
      heading: "Application-Level Pool Configuration",
      body: `Most ORM and database libraries include built-in connection pooling. Configure pool size based on your workload and the number of app instances.`,
      code: `# Python — SQLAlchemy pool settings
from sqlalchemy import create_engine

engine = create_engine(
    "postgresql://user:pass@localhost/myapp",
    pool_size=10,          # number of connections to keep open
    max_overflow=20,       # extra connections allowed above pool_size
    pool_timeout=30,       # seconds to wait for a connection before error
    pool_pre_ping=True,    # test connection before use (detects stale connections)
    pool_recycle=3600,     # recycle connections after 1 hour
)

# Python — asyncpg (async PostgreSQL)
import asyncpg

pool = await asyncpg.create_pool(
    dsn="postgresql://user:pass@localhost/myapp",
    min_size=5,
    max_size=20,
)

# Node.js — pg (node-postgres)
const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,              // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

# Pool sizing rule of thumb:
# pool_size = (core_count * 2) + effective_spindle_count
# For a 4-core server: pool_size ≈ 10
# With PgBouncer: app pool_size = 2–5, PgBouncer handles the rest`,
    },
    {
      heading: "Slow Query Analysis",
      body: `Identifying and fixing slow queries is one of the most impactful performance improvements. PostgreSQL provides built-in tools to find them.`,
      code: `-- Enable slow query logging in postgresql.conf
-- log_min_duration_statement = 1000  (log queries > 1000ms)

-- pg_stat_statements: tracks query statistics over time
-- Enable in postgresql.conf: shared_preload_libraries = 'pg_stat_statements'
CREATE EXTENSION pg_stat_statements;

-- Find your slowest queries
SELECT
  query,
  calls,
  ROUND(total_exec_time::numeric, 2)         AS total_ms,
  ROUND(mean_exec_time::numeric, 2)          AS avg_ms,
  ROUND(stddev_exec_time::numeric, 2)        AS stddev_ms,
  rows
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Find tables with the most sequential scans (candidates for new indexes)
SELECT
  schemaname,
  relname         AS table_name,
  seq_scan,
  idx_scan,
  n_live_tup      AS row_count
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;

-- Find missing indexes on foreign keys
SELECT
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = tc.table_name
      AND indexdef LIKE '%' || kcu.column_name || '%'
  );`,
    },
    {
      heading: "VACUUM & Table Bloat",
      body: `PostgreSQL uses **MVCC** (Multi-Version Concurrency Control) — when you UPDATE or DELETE a row, the old version is kept until no transaction can see it. **VACUUM** removes these dead rows. Without vacuuming, tables grow bloated with dead rows that slow down all queries.`,
      items: [
        "**AUTOVACUUM** runs in the background automatically — don't disable it",
        "**VACUUM** — removes dead rows (reclaims space for reuse within the table)",
        "**VACUUM FULL** — rewrites the entire table to disk (compacts space, takes exclusive lock — use rarely and during maintenance windows)",
        "**ANALYZE** — updates statistics used by the query planner. Run after large data imports: `ANALYZE orders;`",
        "**Table bloat** — monitor with pg_stat_user_tables. High `n_dead_tup` means autovacuum is falling behind",
        "**bloat tuning** — if heavy write workloads cause autovacuum to fall behind, tune `autovacuum_vacuum_scale_factor` and `autovacuum_vacuum_cost_delay`",
      ],
    },
  ],
};
