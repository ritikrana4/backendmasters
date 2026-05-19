export const content = {
  title: "SELECT — Querying Data",
  sections: [
    {
      heading: "The SELECT Statement",
      body: `**SELECT** is the most-used SQL statement. It reads data from one or more tables without modifying anything. The full logical execution order matters for understanding filters and aliases: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.`,
      code: `-- Basic syntax
SELECT column1, column2 FROM table_name;

-- Select all columns (avoid in production — fragile and slow)
SELECT * FROM users;

-- Select specific columns
SELECT id, name, email FROM users;

-- Column aliases — rename output columns
SELECT id, name AS full_name, email AS contact FROM users;

-- Computed columns
SELECT
  id,
  name,
  price * quantity AS total_value
FROM order_items;`,
    },
    {
      heading: "WHERE — Filtering Rows",
      body: `**WHERE** filters which rows are returned. It runs before SELECT, so you can't reference aliases defined in SELECT inside a WHERE clause.`,
      code: `-- Comparison operators: =  !=  <  >  <=  >=
SELECT * FROM users WHERE id = 42;
SELECT * FROM products WHERE price > 100;
SELECT * FROM orders WHERE status != 'cancelled';

-- Logical operators: AND, OR, NOT
SELECT * FROM users WHERE age >= 18 AND country = 'US';
SELECT * FROM products WHERE category = 'Books' OR category = 'Music';
SELECT * FROM users WHERE NOT is_banned;

-- BETWEEN (inclusive on both ends)
SELECT * FROM orders WHERE total BETWEEN 50 AND 200;

-- IN — match any value in a list
SELECT * FROM users WHERE role IN ('admin', 'moderator');
SELECT * FROM orders WHERE status NOT IN ('cancelled', 'refunded');

-- LIKE — pattern matching (case-sensitive in most DBs)
-- % = any number of characters, _ = exactly one character
SELECT * FROM users WHERE name LIKE 'Ali%';      -- starts with Ali
SELECT * FROM products WHERE sku LIKE 'SKU-___'; -- SKU- followed by 3 chars

-- ILIKE — case-insensitive LIKE (PostgreSQL)
SELECT * FROM users WHERE email ILIKE '%@gmail.com';`,
    },
    {
      heading: "NULL Handling",
      body: `**NULL** means unknown or missing — it's not zero, not empty string, not false. NULL comparisons require special syntax: you cannot use = or != to check for NULL.`,
      code: `-- WRONG — always returns no rows even if NULLs exist
SELECT * FROM users WHERE bio = NULL;
SELECT * FROM users WHERE bio != NULL;

-- CORRECT — use IS NULL / IS NOT NULL
SELECT * FROM users WHERE bio IS NULL;
SELECT * FROM users WHERE bio IS NOT NULL;

-- COALESCE — return first non-NULL value
SELECT name, COALESCE(bio, 'No bio provided') AS bio FROM users;

-- NULLIF — returns NULL if both args are equal, otherwise returns first arg
-- Useful to avoid division by zero
SELECT total / NULLIF(count, 0) AS average FROM stats;

-- NULL in aggregations: COUNT(*) counts all rows, COUNT(col) skips NULLs
SELECT
  COUNT(*)    AS total_rows,       -- counts all rows
  COUNT(bio)  AS rows_with_bio     -- skips NULLs
FROM users;`,
    },
    {
      heading: "ORDER BY, LIMIT, OFFSET",
      body: `**ORDER BY** sorts results. **LIMIT** caps the number of rows returned. **OFFSET** skips rows — used together for pagination (though cursor-based pagination is better at scale).`,
      code: `-- ORDER BY: ASC (default) or DESC
SELECT * FROM products ORDER BY price ASC;
SELECT * FROM users ORDER BY created_at DESC;

-- Multiple sort columns — sort by first, break ties with second
SELECT * FROM employees ORDER BY department ASC, salary DESC;

-- NULL sorting: NULLs come last in ASC, first in DESC by default
SELECT * FROM users ORDER BY last_login DESC NULLS LAST;

-- LIMIT — return at most N rows
SELECT * FROM products ORDER BY created_at DESC LIMIT 10;

-- OFFSET — skip N rows (for page-based pagination)
-- Page 1: LIMIT 10 OFFSET 0
-- Page 2: LIMIT 10 OFFSET 10
-- Page 3: LIMIT 10 OFFSET 20
SELECT * FROM products ORDER BY id LIMIT 10 OFFSET 20;

-- ⚠ OFFSET has a performance problem: the DB scans and discards all skipped rows
-- For large datasets, use cursor-based pagination instead:
SELECT * FROM products WHERE id > :last_seen_id ORDER BY id LIMIT 10;`,
    },
    {
      heading: "DISTINCT",
      body: `**DISTINCT** removes duplicate rows from the result. It applies to the full row (or set of selected columns), not just one column.`,
      code: `-- Return unique values in one column
SELECT DISTINCT country FROM users;

-- Return unique combinations of columns
SELECT DISTINCT country, city FROM users;

-- COUNT DISTINCT — count unique values
SELECT COUNT(DISTINCT country) AS unique_countries FROM users;

-- ⚠ DISTINCT is often a code smell
-- If you're deduplicating a join result, your join condition is probably wrong
-- Fix the query logic rather than slapping DISTINCT on it`,
    },
  ],
};
