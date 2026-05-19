export const content = {
  title: "Aggregations & GROUP BY",
  sections: [
    {
      heading: "Aggregate Functions",
      body: `**Aggregate functions** compute a single result from a set of rows. They collapse many rows into one summary value. By default (without GROUP BY), they operate on the entire result set.`,
      code: `-- COUNT — number of rows
SELECT COUNT(*) FROM orders;           -- all rows (including NULLs)
SELECT COUNT(refund_id) FROM orders;   -- rows where refund_id is NOT NULL

-- SUM — total of a numeric column
SELECT SUM(total) FROM orders WHERE status = 'completed';

-- AVG — arithmetic mean (ignores NULLs)
SELECT AVG(price) FROM products WHERE category = 'Books';

-- MIN / MAX
SELECT MIN(price), MAX(price) FROM products;

-- Combined in one query
SELECT
  COUNT(*)           AS total_orders,
  SUM(total)         AS revenue,
  AVG(total)         AS avg_order_value,
  MIN(total)         AS smallest_order,
  MAX(total)         AS largest_order
FROM orders
WHERE status = 'completed';`,
    },
    {
      heading: "GROUP BY",
      body: `**GROUP BY** splits rows into groups by one or more columns, then applies aggregate functions to each group separately. Every column in SELECT must either be in GROUP BY or wrapped in an aggregate function.`,
      code: `-- Count orders per status
SELECT status, COUNT(*) AS order_count
FROM orders
GROUP BY status;

-- Revenue per user
SELECT
  user_id,
  COUNT(*)    AS order_count,
  SUM(total)  AS total_spent,
  AVG(total)  AS avg_order
FROM orders
GROUP BY user_id
ORDER BY total_spent DESC;

-- Group by multiple columns
SELECT
  category,
  status,
  COUNT(*) AS count
FROM products
GROUP BY category, status;

-- Join + aggregate: revenue per user name
SELECT
  u.name,
  COUNT(o.id)  AS orders,
  SUM(o.total) AS revenue
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name
ORDER BY revenue DESC NULLS LAST;`,
    },
    {
      heading: "HAVING — Filtering Groups",
      body: `**HAVING** filters groups after aggregation — it's the GROUP BY equivalent of WHERE. WHERE filters individual rows before grouping; HAVING filters groups after aggregation.`,
      code: `-- Only show users who have placed more than 2 orders
SELECT user_id, COUNT(*) AS order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 2;

-- Users who spent more than $500 total
SELECT user_id, SUM(total) AS total_spent
FROM orders
GROUP BY user_id
HAVING SUM(total) > 500;

-- WHERE vs HAVING together:
-- WHERE filters rows BEFORE grouping
-- HAVING filters groups AFTER aggregation
SELECT
  user_id,
  COUNT(*) AS completed_orders
FROM orders
WHERE status = 'completed'       -- filter rows first: only completed orders
GROUP BY user_id
HAVING COUNT(*) >= 3             -- then filter groups: only users with 3+ completed
ORDER BY completed_orders DESC;`,
    },
    {
      heading: "COUNT DISTINCT & Advanced Patterns",
      body: `Combining DISTINCT with aggregates, and other patterns you'll see in interviews and production queries.`,
      code: `-- COUNT DISTINCT — count unique values
SELECT COUNT(DISTINCT user_id) AS unique_buyers FROM orders;

-- Conditional aggregation — pivot-like counts in one query
SELECT
  COUNT(*) FILTER (WHERE status = 'completed')  AS completed,
  COUNT(*) FILTER (WHERE status = 'pending')    AS pending,
  COUNT(*) FILTER (WHERE status = 'cancelled')  AS cancelled
FROM orders;

-- Equivalent with CASE (works in all SQL databases)
SELECT
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
  SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) AS pending
FROM orders;

-- GROUP BY with ROLLUP — adds subtotals
SELECT
  category,
  status,
  COUNT(*) AS count
FROM products
GROUP BY ROLLUP (category, status);
-- Last row will be a grand total with NULLs in category and status

-- Date truncation for time-series aggregation
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*)                         AS order_count,
  SUM(total)                       AS revenue
FROM orders
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;`,
    },
  ],
};
