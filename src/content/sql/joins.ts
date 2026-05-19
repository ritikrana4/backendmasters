export const content = {
  title: "Joins",
  sections: [
    {
      heading: "What is a Join?",
      body: `A **join** combines rows from two or more tables based on a related column. Instead of duplicating data across tables, you store it once and join it at query time. Joins are fundamental to relational databases — they're what makes the "relational" part useful.`,
      code: `-- Setup for all examples
CREATE TABLE users (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL
);

CREATE TABLE orders (
  id      SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total   NUMERIC(10,2),
  status  TEXT
);

INSERT INTO users VALUES (1,'Alice'), (2,'Bob'), (3,'Carol');
INSERT INTO orders VALUES
  (1, 1, 50.00, 'completed'),
  (2, 1, 30.00, 'pending'),
  (3, 2, 80.00, 'completed');
-- Note: Carol (id=3) has no orders
-- Note: no order has user_id=4 (non-existent)`,
    },
    {
      heading: "INNER JOIN",
      body: `**INNER JOIN** returns only rows that have a matching row in **both** tables. Rows with no match on either side are excluded.`,
      code: `-- Get orders with user names — only where both sides match
SELECT
  u.name,
  o.id    AS order_id,
  o.total,
  o.status
FROM orders o
INNER JOIN users u ON o.user_id = u.id;

-- Result:
-- name  | order_id | total | status
-- Alice |    1     | 50.00 | completed
-- Alice |    2     | 30.00 | pending
-- Bob   |    3     | 80.00 | completed
-- Carol is excluded — she has no orders
-- JOIN is shorthand for INNER JOIN`,
    },
    {
      heading: "LEFT JOIN",
      body: `**LEFT JOIN** returns all rows from the left table, plus matched rows from the right. If there's no match on the right, the right columns are NULL. This is the most commonly used join after INNER.`,
      code: `-- Get ALL users and their orders (or NULL if no orders)
SELECT
  u.name,
  o.id    AS order_id,
  o.total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;

-- Result:
-- name  | order_id | total
-- Alice |    1     | 50.00
-- Alice |    2     | 30.00
-- Bob   |    3     | 80.00
-- Carol |   NULL   | NULL   ← Carol included even with no orders

-- Find users with NO orders (anti-join pattern)
SELECT u.name
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;
-- Returns only Carol`,
    },
    {
      heading: "RIGHT JOIN & FULL OUTER JOIN",
      body: `**RIGHT JOIN** is a mirror of LEFT JOIN — all rows from the right table, NULLs for unmatched left. In practice, you can always rewrite a RIGHT JOIN as a LEFT JOIN by swapping the table order. **FULL OUTER JOIN** returns all rows from both tables.`,
      code: `-- RIGHT JOIN — all orders, even those without a valid user
-- (practically: same as LEFT JOIN with tables swapped)
SELECT u.name, o.id, o.total
FROM users u
RIGHT JOIN orders o ON o.user_id = u.id;

-- FULL OUTER JOIN — all rows from both sides, NULLs for no match
SELECT u.name, o.id, o.total
FROM users u
FULL OUTER JOIN orders o ON o.user_id = u.id;

-- Result includes: Alice's orders, Bob's orders, Carol (NULL order),
-- and any orders with no matching user (NULL name)

-- Find unmatched rows on EITHER side
SELECT u.name, o.id
FROM users u
FULL OUTER JOIN orders o ON o.user_id = u.id
WHERE u.id IS NULL OR o.id IS NULL;`,
    },
    {
      heading: "SELF JOIN & CROSS JOIN",
      body: `A **SELF JOIN** joins a table to itself — used for hierarchical or comparative data. A **CROSS JOIN** returns the cartesian product (every combination of rows from both tables) — use deliberately, rarely.`,
      code: `-- SELF JOIN: employee hierarchy (manager is also an employee)
CREATE TABLE employees (
  id         INTEGER PRIMARY KEY,
  name       TEXT,
  manager_id INTEGER REFERENCES employees(id)
);

SELECT
  e.name        AS employee,
  m.name        AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- CROSS JOIN: generate all size × colour combinations
SELECT sizes.label AS size, colours.label AS colour
FROM sizes
CROSS JOIN colours;
-- 3 sizes × 4 colours = 12 rows`,
    },
    {
      heading: "Joining Multiple Tables",
      body: `You can chain as many joins as needed. Keep them readable by aliasing tables with short, meaningful letters and aligning the ON conditions.`,
      code: `-- Order details with user name and product name
SELECT
  u.name          AS customer,
  o.created_at    AS ordered_at,
  p.name          AS product,
  oi.quantity,
  oi.unit_price
FROM orders o
JOIN users        u  ON o.user_id     = u.id
JOIN order_items  oi ON oi.order_id   = o.id
JOIN products     p  ON oi.product_id = p.id
WHERE o.status = 'completed'
ORDER BY o.created_at DESC;

-- Interview tip: always think about which join type is right
-- Does every row in the left table need to appear? → LEFT JOIN
-- Only rows with matches on both sides? → INNER JOIN
-- All rows regardless? → FULL OUTER JOIN`,
    },
  ],
};
