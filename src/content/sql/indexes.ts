export const content = {
  title: "Indexes & Query Optimization",
  sections: [
    {
      heading: "What is an Index?",
      body: `An **index** is a separate data structure the database maintains alongside a table to make lookups faster. Without an index, a query must scan every row in the table (a **full table scan** or **seq scan**). With an index, the database can jump directly to matching rows.`,
      items: [
        "**B-tree index** (default) — balanced tree structure, O(log n) lookups. Works for =, <, >, BETWEEN, LIKE 'prefix%', ORDER BY",
        "**Hash index** — O(1) equality lookups only. Only useful for =, not range queries or sorting",
        "**GIN index** — inverted index for arrays, JSONB, and full-text search",
        "**GiST index** — geometric/spatial data, full-text search, range types",
        "Every PRIMARY KEY and UNIQUE constraint automatically creates an index",
        "Indexes speed up reads but slow down writes — each INSERT/UPDATE/DELETE must also update the index",
      ],
      code: `-- Create an index on a single column
CREATE INDEX idx_users_email ON users(email);

-- Create an index on a foreign key (always index FK columns)
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Composite index (column order matters — leftmost prefix rule)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
-- This index helps: WHERE user_id = 42
-- This index helps: WHERE user_id = 42 AND status = 'completed'
-- This does NOT help: WHERE status = 'completed' (missing leftmost column)

-- Partial index — only index rows matching a condition (smaller, faster)
CREATE INDEX idx_orders_pending ON orders(created_at)
WHERE status = 'pending';

-- Expression index
CREATE INDEX idx_users_lower_email ON users(LOWER(email));
-- Enables: WHERE LOWER(email) = 'alice@example.com'

-- Drop an index
DROP INDEX idx_users_email;`,
    },
    {
      heading: "EXPLAIN & EXPLAIN ANALYZE",
      body: `**EXPLAIN** shows the query plan the database chose. **EXPLAIN ANALYZE** actually runs the query and shows real timings. Reading query plans is the primary tool for diagnosing slow queries.`,
      code: `-- EXPLAIN: show the plan without executing
EXPLAIN SELECT * FROM orders WHERE user_id = 42;

-- EXPLAIN ANALYZE: execute and show actual timing
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;

-- Full verbose output
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.name, COUNT(o.id)
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id;

-- Key plan node types to recognize:
-- Seq Scan     → full table scan — OK for small tables, bad for large ones
-- Index Scan   → uses index, fetches rows from table (heap)
-- Index Only Scan → uses index, no table fetch needed (fastest)
-- Bitmap Heap Scan → bulk index scan, more efficient for many matching rows
-- Hash Join    → join using a hash table (good for large unsorted sets)
-- Nested Loop  → join row-by-row (good when inner set is small or indexed)
-- Merge Join   → join two sorted sets (good for large sorted inputs)

-- What to look for:
-- 'rows=' estimate vs actual rows: big difference = stale statistics
-- 'cost=' is relative, not wall-clock time
-- 'actual time=' in ANALYZE is in milliseconds
-- Seq Scan on a large table in a hot path = add an index`,
    },
    {
      heading: "When to Add (and Not Add) an Index",
      body: `Indexes are not free — every write must update all relevant indexes. Over-indexing hurts write performance and wastes storage.`,
      items: [
        "**Add indexes on**: columns in WHERE, JOIN ON, ORDER BY, GROUP BY — especially on high-cardinality columns",
        "**Always index foreign keys** — otherwise JOINs and ON DELETE CASCADE do full scans",
        "**Don't index low-cardinality columns**: a boolean with 50% true/false is useless — the DB will seq scan anyway",
        "**Don't index every column** — each index adds overhead to INSERT/UPDATE/DELETE",
        "**Partial indexes** for queries that always filter on a condition (e.g., `WHERE deleted_at IS NULL`)",
        "**Composite index column order**: put the most selective column first, or the column used in equality filters before range columns",
        "**CONCURRENTLY**: create indexes without locking the table in production: `CREATE INDEX CONCURRENTLY idx_...`",
      ],
    },
    {
      heading: "The N+1 Query Problem",
      body: `The **N+1 problem** is a classic performance bug: fetching a list of N items, then making one additional query per item to fetch related data. The result is 1 + N queries instead of 2.`,
      code: `-- N+1 problem in application code (pseudocode):
users = db.query("SELECT * FROM users LIMIT 10")   -- 1 query
for user in users:
    orders = db.query(f"SELECT * FROM orders WHERE user_id = {user.id}")
    -- 10 more queries = 11 total

-- Fix 1: JOIN — fetch everything in one query
SELECT u.*, o.id AS order_id, o.total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
LIMIT 10;

-- Fix 2: IN clause — fetch all related records in one query
user_ids = [u.id for u in users]
orders = db.query(f"SELECT * FROM orders WHERE user_id IN ({','.join(user_ids)})")
-- 2 queries total, combine in application code

-- Fix 3: Use an ORM's eager loading (prevents N+1 at the framework level)
# Django
users = User.objects.prefetch_related('orders')[:10]
# SQLAlchemy
users = session.query(User).options(joinedload(User.orders)).limit(10)`,
    },
    {
      heading: "Query Optimization Checklist",
      body: `A practical checklist for diagnosing and fixing slow queries:`,
      items: [
        "Run `EXPLAIN ANALYZE` — find seq scans on large tables, bad row estimates, slow joins",
        "**Index the columns in WHERE and JOIN ON** — especially foreign keys",
        "**Avoid functions on indexed columns in WHERE**: `WHERE LOWER(email) = ...` won't use an index on `email` — create an expression index instead",
        "**Avoid SELECT *** — fetch only needed columns, reduces I/O and network",
        "**Avoid OFFSET at large values** — use cursor-based pagination instead",
        "**Run ANALYZE** to update statistics if estimates are far off: `ANALYZE users;`",
        "**Use connection pooling** — don't let your app open a new DB connection per request",
        "Check for missing indexes with `pg_stat_user_tables` (seq_scan column shows tables being full-scanned frequently)",
      ],
    },
  ],
};
