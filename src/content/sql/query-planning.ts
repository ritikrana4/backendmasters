export const content = {
  title: "Query Planning & EXPLAIN",
  sections: [
    {
      heading: "How PostgreSQL Chooses a Query Plan",
      body: `Before executing a query, PostgreSQL's **query planner** generates multiple candidate execution plans and estimates their cost using statistics about your data (row counts, column value distributions, table sizes). It picks the plan with the lowest estimated cost.

Understanding how the planner thinks — and when it gets it wrong — is the key to diagnosing slow queries.`,
      items: [
        "**Statistics**: `pg_statistic` stores per-column statistics (most common values, histogram buckets, null fraction). Updated by `ANALYZE` (runs automatically via autovacuum).",
        "**Cost model**: the planner assigns costs in abstract units: sequential page reads = 1.0, random page reads = 4.0 (default), CPU processing per row = 0.01. These reflect I/O vs CPU trade-offs.",
        "**Plan nodes**: each step in the plan is a node (Seq Scan, Index Scan, Hash Join, Sort, Limit). Nodes are nested — the output of one feeds into the next.",
        "**Bad estimates**: if statistics are stale (after a large data load) or skewed, the planner picks a suboptimal plan. Run `ANALYZE table_name` to refresh.",
      ],
    },
    {
      heading: "EXPLAIN vs EXPLAIN ANALYZE",
      body: `\`EXPLAIN\` shows the plan the planner **chose** and its estimated costs. \`EXPLAIN ANALYZE\` **actually runs the query** and shows both estimates and real measurements. Always use \`ANALYZE\` for tuning — estimated costs alone can be misleading.`,
      code: `-- Estimated plan only (query NOT executed)
EXPLAIN
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name;

-- Actual timings (query IS executed — use on non-production or with ROLLBACK)
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name;

-- Sample output:
-- HashAggregate  (cost=1240.50..1265.50 rows=2500 width=40)
--                (actual time=45.2..46.1 rows=2312 loops=1)
--   Group Key: u.id, u.name
--   ->  Hash Join  (cost=450.00..1177.00 rows=12700 width=24)
--                  (actual time=12.3..38.4 rows=12701 loops=1)
--         Hash Cond: (o.user_id = u.id)
--         ->  Seq Scan on orders o  (cost=0..310 rows=18000 width=8)
--                                   (actual time=0.05..8.2 rows=18000 loops=1)
--         ->  Hash  (cost=418.00..418.00 rows=2500 width=20)
--               ->  Index Scan using idx_users_created_at on users u
--                   (actual time=0.1..5.3 rows=2312 loops=1)
--                   Index Cond: (created_at > '2024-01-01')
-- Planning Time: 1.2 ms
-- Execution Time: 46.8 ms`,
    },
    {
      heading: "Reading a Query Plan",
      body: `Query plans are trees — read from the **innermost (most indented) node outward**. Each node shows estimated rows, estimated cost, and (with ANALYZE) actual rows and actual time.`,
      items: [
        "**cost=start..total**: `start` is cost before the node outputs its first row; `total` is cost when all rows are output. Compare these to identify expensive nodes.",
        "**rows=N**: estimated row count. Compare with `actual rows=N` — a large discrepancy means stale statistics.",
        "**loops=N**: the node ran N times (e.g. nested loop inner side). Actual time is *per loop* — multiply by loops for total.",
        "**Seq Scan**: reads the entire table. Fine for small tables or when returning most rows. Bad on large tables with a selective filter — add an index.",
        "**Index Scan**: uses a B-tree index to fetch rows directly. Fast for selective queries. Adds random I/O — can be slower than Seq Scan when returning many rows.",
        "**Index Only Scan**: all needed columns are in the index — no heap access. Very fast.",
        "**Bitmap Heap Scan**: collects matching row locations from an index, then fetches them in physical order (reduces random I/O). Used when index scan would require too many random reads.",
        "**Hash Join**: builds a hash table from the smaller relation, probes it with the larger. Good for large unsorted joins.",
        "**Nested Loop**: for each outer row, scans the inner. Efficient when the inner side uses an index and the outer set is small.",
        "**Merge Join**: both sides must be sorted. Efficient when data is already sorted or both sides are large.",
      ],
    },
    {
      heading: "Identifying & Fixing Slow Plans",
      body: `The most common causes of slow queries: missing indexes, bad row count estimates, unnecessary sequential scans, and N+1 patterns at the ORM layer.`,
      code: `-- 1. Missing index — seq scan on large table with selective filter
-- Slow:
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
-- Seq Scan on orders  (cost=0..18000.00 rows=18000)
--                     (actual time=0.05..140.3 rows=7 loops=1)  ← reads all 18000 rows to find 7

-- Fix: add an index
CREATE INDEX idx_orders_user_id ON orders(user_id);
-- Now: Index Scan using idx_orders_user_id (actual time=0.1..0.3 rows=7 loops=1)

-- 2. Stale statistics → bad row estimate
-- After a bulk load, estimates are wrong
ANALYZE orders;   -- refresh statistics

-- 3. The planner picks a seq scan even with an index
-- This happens when the query returns too many rows (index not worth it)
-- or when the planner overestimates seq scan speed vs index scan
-- Force index use temporarily for testing:
SET enable_seqscan = OFF;
EXPLAIN SELECT * FROM orders WHERE user_id = 42;
SET enable_seqscan = ON;   -- always reset

-- 4. Slow aggregation — add a partial index for common filters
CREATE INDEX idx_orders_recent ON orders(user_id, created_at)
WHERE created_at > '2024-01-01';

-- 5. Check which queries are slow in production
SELECT query, mean_exec_time, calls, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;`,
    },
  ],
  starterCode: `# Query plan analysis — simulating cost estimation logic

# Real usage: run these in PostgreSQL
# EXPLAIN (ANALYZE, BUFFERS) SELECT ...

# This simulation shows how the planner thinks about costs

def seq_scan_cost(rows: int, page_size: int = 8192, bytes_per_row: int = 100) -> float:
    """Estimate cost of reading an entire table sequentially."""
    pages = (rows * bytes_per_row) / page_size
    seq_page_cost = 1.0        # PostgreSQL default
    cpu_tuple_cost = 0.01      # per-row CPU cost
    return pages * seq_page_cost + rows * cpu_tuple_cost

def index_scan_cost(matching_rows: int, index_pages: int = 10) -> float:
    """Estimate cost of an index scan for a selective query."""
    random_page_cost = 4.0     # random I/O is ~4x more expensive than sequential
    cpu_index_tuple_cost = 0.005
    # index traversal + random heap fetch per matching row
    return index_pages * seq_page_cost + matching_rows * (random_page_cost + cpu_index_tuple_cost)

seq_page_cost = 1.0

table_rows = 100_000
selective_rows = 10   # WHERE user_id = 42 matches 10 rows

seq_cost   = seq_scan_cost(table_rows)
idx_cost   = index_scan_cost(selective_rows)

print(f"Table rows:       {table_rows:,}")
print(f"Matching rows:    {selective_rows}")
print(f"Seq Scan cost:    {seq_cost:,.1f}")
print(f"Index Scan cost:  {idx_cost:,.1f}")
print(f"Winner: {'Index Scan' if idx_cost < seq_cost else 'Seq Scan'}")

# Try changing selective_rows to 50000 — seq scan wins
`,
};
