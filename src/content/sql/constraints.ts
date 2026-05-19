export const content = {
  title: "Constraints & Keys",
  sections: [
    {
      heading: "Why Constraints?",
      body: `**Constraints** are rules enforced by the database itself — not just by application code. They guarantee data integrity at the storage layer, so invalid data can never enter the database regardless of bugs in application code. Relying solely on application-level validation is a common and costly mistake.`,
      code: `-- Bad: validation only in application code
# Python (no DB constraint)
if not user.email:
    raise ValueError("Email required")
db.execute("INSERT INTO users (email) VALUES (?)", [user.email])
# Bug in code → NULL emails enter the database

-- Good: constraint at DB level
CREATE TABLE users (
  id    SERIAL PRIMARY KEY,
  email TEXT NOT NULL   -- database refuses NULL, always
);`,
    },
    {
      heading: "PRIMARY KEY",
      body: `A **primary key** uniquely identifies each row. It implicitly adds NOT NULL and UNIQUE, and automatically creates an index. Every table should have one.`,
      code: `-- Single-column primary key (auto-increment integer)
CREATE TABLE users (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- UUID primary key (globally unique, good for distributed systems)
CREATE TABLE events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL
);

-- Composite primary key (unique combination of two columns)
CREATE TABLE order_items (
  order_id   INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity   INTEGER NOT NULL,
  PRIMARY KEY (order_id, product_id)  -- each product appears once per order
);

-- Surrogate vs natural key:
-- SERIAL id → surrogate: artificial, stable, never changes
-- email as PK → natural: meaningful, but users change emails
-- Prefer surrogate keys for most cases`,
    },
    {
      heading: "FOREIGN KEY",
      body: `A **foreign key** enforces referential integrity — it guarantees that a value in one table references a valid row in another. You control what happens when the referenced row is deleted or updated.`,
      code: `CREATE TABLE orders (
  id      SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  --                                            ↑ delete orders when user deleted

  product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
  --                                         ↑ prevent deleting a product with orders

  coupon_id  INTEGER REFERENCES coupons(id)  ON DELETE SET NULL
  --                                         ↑ allow coupon deletion, set to NULL
);

-- ON DELETE options:
-- CASCADE     → delete child rows when parent is deleted
-- RESTRICT    → prevent parent deletion if children exist (error)
-- SET NULL    → set FK column to NULL (column must be nullable)
-- SET DEFAULT → set FK column to its default value
-- NO ACTION   → like RESTRICT, checked at end of transaction (default)

-- Always index foreign key columns
CREATE INDEX idx_orders_user_id    ON orders(user_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);`,
    },
    {
      heading: "UNIQUE, NOT NULL, CHECK, DEFAULT",
      body: `These column-level constraints enforce business rules at the database layer.`,
      code: `CREATE TABLE users (
  id         SERIAL PRIMARY KEY,

  email      TEXT NOT NULL UNIQUE,    -- required + must be unique globally
  username   TEXT NOT NULL,

  role       TEXT NOT NULL DEFAULT 'user',  -- auto-fills if not provided

  age        INTEGER CHECK (age >= 0 AND age <= 150),  -- range validation

  status     TEXT NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'suspended', 'deleted')),

  score      NUMERIC(5,2) CHECK (score BETWEEN 0 AND 100),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Multi-column UNIQUE constraint
CREATE TABLE team_members (
  team_id INTEGER REFERENCES teams(id),
  user_id INTEGER REFERENCES users(id),
  UNIQUE (team_id, user_id)  -- same user can't be in the same team twice
);

-- Named constraints (easier to identify in errors)
ALTER TABLE products
ADD CONSTRAINT products_price_positive CHECK (price > 0);`,
    },
    {
      heading: "Deferrable Constraints",
      body: `By default, constraints are checked immediately after each statement. **Deferrable constraints** can be postponed until the end of the transaction — useful when inserting mutually-referencing rows.`,
      code: `-- Deferrable constraint: check at COMMIT time, not immediately
CREATE TABLE employees (
  id         SERIAL PRIMARY KEY,
  manager_id INTEGER REFERENCES employees(id) DEFERRABLE INITIALLY DEFERRED
);

-- Now you can insert a manager and employee in any order
BEGIN;
INSERT INTO employees (id, manager_id) VALUES (1, 2);  -- manager doesn't exist yet
INSERT INTO employees (id, manager_id) VALUES (2, NULL);  -- now it does
COMMIT;  -- FK checked here — both rows exist → OK

-- SET CONSTRAINTS within a transaction
BEGIN;
SET CONSTRAINTS ALL DEFERRED;
-- do complex inserts
COMMIT;`,
    },
  ],
};
