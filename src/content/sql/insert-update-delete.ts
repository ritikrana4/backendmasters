export const content = {
  title: "INSERT, UPDATE & DELETE",
  sections: [
    {
      heading: "INSERT — Adding Rows",
      body: `**INSERT INTO** adds new rows to a table. Always list the columns explicitly — never rely on positional order, which breaks when the schema changes.`,
      code: `-- Insert a single row (always name columns explicitly)
INSERT INTO users (name, email, role)
VALUES ('Alice', 'alice@example.com', 'user');

-- Insert multiple rows in one statement (much faster than N individual inserts)
INSERT INTO products (name, price, stock)
VALUES
  ('Widget A', 9.99,  100),
  ('Widget B', 14.99, 50),
  ('Widget C', 4.99,  200);

-- Insert and get the generated ID back (PostgreSQL RETURNING)
INSERT INTO users (name, email)
VALUES ('Bob', 'bob@example.com')
RETURNING id, created_at;

-- Insert from a SELECT (copy rows between tables)
INSERT INTO archived_orders (id, user_id, total, created_at)
SELECT id, user_id, total, created_at
FROM orders
WHERE created_at < NOW() - INTERVAL '1 year';`,
    },
    {
      heading: "UPSERT — Insert or Update",
      body: `**Upsert** inserts a row if it doesn't exist, or updates it if it does — based on a unique constraint. PostgreSQL uses \`ON CONFLICT\`. Essential for idempotent writes.`,
      code: `-- ON CONFLICT DO NOTHING — skip if duplicate
INSERT INTO user_settings (user_id, theme)
VALUES (42, 'dark')
ON CONFLICT (user_id) DO NOTHING;

-- ON CONFLICT DO UPDATE — update on duplicate (upsert)
INSERT INTO user_settings (user_id, theme, updated_at)
VALUES (42, 'dark', NOW())
ON CONFLICT (user_id) DO UPDATE
  SET theme      = EXCLUDED.theme,
      updated_at = EXCLUDED.updated_at;
-- EXCLUDED refers to the row that was rejected due to the conflict

-- Upsert on composite key
INSERT INTO page_views (user_id, page, view_count)
VALUES (42, '/home', 1)
ON CONFLICT (user_id, page) DO UPDATE
  SET view_count = page_views.view_count + EXCLUDED.view_count;`,
    },
    {
      heading: "UPDATE — Modifying Rows",
      body: `**UPDATE** modifies existing rows. Always include a **WHERE** clause unless you intentionally want to update every row. An UPDATE without WHERE is almost always a bug.`,
      code: `-- Update a single row
UPDATE users
SET name = 'Alice Smith'
WHERE id = 42;

-- Update multiple columns at once
UPDATE products
SET price       = 12.99,
    updated_at  = NOW()
WHERE id = 7;

-- Update based on a condition across many rows
UPDATE orders
SET status = 'expired'
WHERE status = 'pending' AND created_at < NOW() - INTERVAL '30 days';

-- Update with a calculation
UPDATE products
SET stock = stock - 1
WHERE id = 7 AND stock > 0;

-- UPDATE ... RETURNING (PostgreSQL) — see what changed
UPDATE users
SET last_login = NOW()
WHERE id = 42
RETURNING id, name, last_login;

-- ⚠ ALWAYS include WHERE on UPDATE/DELETE
-- Running UPDATE users SET role = 'admin' with no WHERE → every user becomes admin`,
    },
    {
      heading: "DELETE — Removing Rows",
      body: `**DELETE** removes rows from a table. Like UPDATE, it should almost always have a WHERE clause. Prefer soft deletes (a \`deleted_at\` column) for business data — hard deletes are permanent and lose audit history.`,
      code: `-- Delete a specific row
DELETE FROM users WHERE id = 42;

-- Delete multiple rows matching a condition
DELETE FROM sessions WHERE expires_at < NOW();

-- DELETE with RETURNING — see what was deleted
DELETE FROM cart_items
WHERE user_id = 42
RETURNING product_id, quantity;

-- Soft delete pattern (preferred for business data)
-- Instead of deleting, mark rows as deleted
UPDATE users
SET deleted_at = NOW()
WHERE id = 42;

-- Then filter out soft-deleted rows in queries
SELECT * FROM users WHERE deleted_at IS NULL;

-- TRUNCATE — delete ALL rows very fast (non-transactional in some DBs)
-- Use for clearing test data, not production records
TRUNCATE TABLE sessions;
TRUNCATE TABLE events RESTART IDENTITY;  -- also resets auto-increment`,
    },
    {
      heading: "DELETE vs TRUNCATE vs DROP",
      body: `Three ways to remove data — they operate at completely different levels:`,
      items: [
        "**DELETE** — removes rows matching a WHERE clause. Transactional, triggers fire, can be rolled back. Slow on large tables (row-by-row).",
        "**TRUNCATE** — removes ALL rows instantly by deallocating data pages. Much faster than DELETE for full-table clears. In PostgreSQL it's transactional; in MySQL it's not.",
        "**DROP TABLE** — destroys the entire table structure and all its data permanently. Cannot be rolled back (outside a transaction). Use only for schema changes, never for clearing data.",
        "**Soft delete** — add a `deleted_at TIMESTAMPTZ` column. Mark rows deleted instead of removing them. Preserves history, allows recovery, enables audit trails.",
      ],
    },
  ],
};
