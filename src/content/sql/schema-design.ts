export const content = {
  title: "Schema Design & Normalization",
  sections: [
    {
      heading: "Why Normalize?",
      body: `**Normalization** is the process of structuring a database schema to eliminate redundancy and prevent data anomalies. When the same fact is stored in multiple places, updating it requires changing every copy — miss one and your data becomes inconsistent. Normalization solves this by storing each fact exactly once.`,
      items: [
        "**Update anomaly** — changing a fact in one place but forgetting others",
        "**Insert anomaly** — can't insert some data without also inserting unrelated data",
        "**Delete anomaly** — deleting a row loses other information that was stored alongside it",
        "Normal forms (1NF, 2NF, 3NF) are progressive rules. Real-world schemas aim for 3NF.",
      ],
    },
    {
      heading: "First Normal Form (1NF)",
      body: `A table is in **1NF** if every column holds atomic (indivisible) values, and there are no repeating groups. No arrays, comma-separated lists, or multiple values stuffed into one column.`,
      code: `-- VIOLATES 1NF: multiple phone numbers in one column
CREATE TABLE users_bad (
  id     INTEGER,
  name   TEXT,
  phones TEXT   -- "555-1234, 555-5678" ← not atomic
);

-- SATISFIES 1NF: phone numbers in a separate table
CREATE TABLE users (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE user_phones (
  id      SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  phone   TEXT NOT NULL,
  type    TEXT  -- 'mobile', 'home', 'work'
);
-- Now each phone is its own row — queryable, indexable, independently updateable`,
    },
    {
      heading: "Second Normal Form (2NF)",
      body: `A table is in **2NF** if it's in 1NF and every non-key column depends on the **whole** primary key — not just part of it. This only matters when the primary key is composite.`,
      code: `-- VIOLATES 2NF: composite PK (order_id, product_id)
-- but product_name depends only on product_id, not the full key
CREATE TABLE order_items_bad (
  order_id     INTEGER,
  product_id   INTEGER,
  product_name TEXT,    -- ← depends only on product_id, not the full PK
  quantity     INTEGER,
  unit_price   NUMERIC,
  PRIMARY KEY (order_id, product_id)
);

-- SATISFIES 2NF: separate product info into products table
CREATE TABLE products (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL
);

CREATE TABLE order_items (
  order_id   INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity   INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,  -- snapshot of price at time of order
  PRIMARY KEY (order_id, product_id)
);`,
    },
    {
      heading: "Third Normal Form (3NF)",
      body: `A table is in **3NF** if it's in 2NF and no non-key column depends on another non-key column (no transitive dependencies). Every non-key column should describe the primary key, and nothing else.`,
      code: `-- VIOLATES 3NF: zip_code → city and state
-- city and state depend on zip_code, not on user id directly
CREATE TABLE users_bad (
  id        SERIAL PRIMARY KEY,
  name      TEXT,
  zip_code  TEXT,
  city      TEXT,   -- ← depends on zip_code, not id
  state     TEXT    -- ← depends on zip_code, not id
);

-- SATISFIES 3NF: move zip data to its own table
CREATE TABLE zip_codes (
  zip_code TEXT PRIMARY KEY,
  city     TEXT NOT NULL,
  state    TEXT NOT NULL
);

CREATE TABLE users (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL,
  zip_code TEXT REFERENCES zip_codes(zip_code)
);
-- Now city/state are stored once in zip_codes, not duplicated per user`,
    },
    {
      heading: "Denormalization — When to Break the Rules",
      body: `Normalized schemas are correct, but sometimes deliberately **denormalizing** improves read performance at the cost of write complexity. This is common in reporting databases, analytics, and high-read systems.`,
      items: [
        "**Caching computed values** — store `total_order_count` on the user row to avoid counting every time",
        "**Duplicating for read performance** — store `user_name` on orders so you don't need a JOIN for every read",
        "**Materialized views** — a precomputed table that stores results of a complex query, refreshed periodically",
        "**Separate OLTP from OLAP** — normalized schema for writes (OLTP), denormalized data warehouse for analytics (OLAP)",
        "The rule: normalize first, then selectively denormalize based on measured performance problems — not speculation",
      ],
      code: `-- Materialized view: precomputed user stats
CREATE MATERIALIZED VIEW user_stats AS
SELECT
  u.id,
  u.name,
  COUNT(o.id)  AS order_count,
  SUM(o.total) AS lifetime_value
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;

CREATE UNIQUE INDEX ON user_stats(id);

-- Refresh when data changes (or on a schedule)
REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;

-- Query like a normal table
SELECT name, lifetime_value FROM user_stats ORDER BY lifetime_value DESC;`,
    },
  ],
};
