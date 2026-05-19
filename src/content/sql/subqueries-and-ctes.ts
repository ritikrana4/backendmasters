export const content = {
  title: "Subqueries & CTEs",
  sections: [
    {
      heading: "Subqueries",
      body: `A **subquery** is a SELECT statement nested inside another query. They can appear in WHERE, FROM, or SELECT clauses. Subqueries let you break complex problems into smaller pieces — but CTEs are usually more readable for multi-step logic.`,
      code: `-- Subquery in WHERE: users who have placed at least one order
SELECT name, email
FROM users
WHERE id IN (
  SELECT DISTINCT user_id FROM orders
);

-- Subquery in WHERE with comparison
-- Find orders above average total
SELECT id, user_id, total
FROM orders
WHERE total > (SELECT AVG(total) FROM orders);

-- Subquery in FROM (derived table — must be aliased)
SELECT dept, avg_salary
FROM (
  SELECT department AS dept, AVG(salary) AS avg_salary
  FROM employees
  GROUP BY department
) AS dept_averages
WHERE avg_salary > 80000;

-- Subquery in SELECT (scalar subquery — must return exactly one value)
SELECT
  name,
  (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
FROM users u;`,
    },
    {
      heading: "EXISTS & NOT EXISTS",
      body: `**EXISTS** checks whether a subquery returns any rows — it doesn't return the data, just true/false. It's often faster than IN for large datasets because it short-circuits on the first match.`,
      code: `-- EXISTS: users who have at least one completed order
SELECT name
FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.user_id = u.id AND o.status = 'completed'
);

-- NOT EXISTS: users who have NEVER placed an order (anti-join)
SELECT name
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- IN vs EXISTS performance:
-- IN: evaluates the full subquery first, then checks membership
-- EXISTS: stops as soon as it finds a match — better for large tables
-- Both work; EXISTS is often preferred for correlated subqueries

-- IN with NULL gotcha:
-- If the subquery returns any NULLs, NOT IN returns NO rows
-- Use NOT EXISTS instead of NOT IN when NULLs are possible
SELECT name FROM users
WHERE id NOT IN (SELECT user_id FROM orders WHERE user_id IS NOT NULL);`,
    },
    {
      heading: "CTEs — Common Table Expressions",
      body: `A **CTE** (introduced with \`WITH\`) gives a name to a subquery result, making complex queries readable and maintainable. Think of it as a named temporary view that exists only for the duration of the query.`,
      code: `-- Basic CTE: readable multi-step logic
WITH completed_orders AS (
  SELECT user_id, SUM(total) AS total_spent
  FROM orders
  WHERE status = 'completed'
  GROUP BY user_id
)
SELECT
  u.name,
  co.total_spent
FROM users u
JOIN completed_orders co ON co.user_id = u.id
WHERE co.total_spent > 500
ORDER BY co.total_spent DESC;

-- Multiple CTEs chained together
WITH
  order_counts AS (
    SELECT user_id, COUNT(*) AS num_orders
    FROM orders
    GROUP BY user_id
  ),
  high_value_users AS (
    SELECT user_id
    FROM orders
    GROUP BY user_id
    HAVING SUM(total) > 1000
  )
SELECT u.name, oc.num_orders
FROM users u
JOIN order_counts    oc  ON oc.user_id = u.id
JOIN high_value_users hv ON hv.user_id = u.id
ORDER BY oc.num_orders DESC;`,
    },
    {
      heading: "Recursive CTEs",
      body: `**Recursive CTEs** reference themselves to traverse hierarchical or graph data — org charts, file trees, category trees, threaded comments. They have two parts: the base case (anchor) and the recursive step.`,
      code: `-- Employee hierarchy: find all reports under a manager
WITH RECURSIVE subordinates AS (
  -- Base case: start with the root manager
  SELECT id, name, manager_id, 0 AS depth
  FROM employees
  WHERE id = 1  -- CEO

  UNION ALL

  -- Recursive step: find direct reports of employees already in the CTE
  SELECT e.id, e.name, e.manager_id, s.depth + 1
  FROM employees e
  JOIN subordinates s ON e.manager_id = s.id
)
SELECT name, depth FROM subordinates ORDER BY depth, name;

-- Category tree: find all subcategories of 'Electronics'
WITH RECURSIVE category_tree AS (
  SELECT id, name, parent_id, 0 AS level
  FROM categories WHERE name = 'Electronics'

  UNION ALL

  SELECT c.id, c.name, c.parent_id, ct.level + 1
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT name, level FROM category_tree;

-- ⚠ Always add a depth/level counter and a WHERE depth < N
-- to prevent infinite loops on circular references`,
    },
  ],
};
