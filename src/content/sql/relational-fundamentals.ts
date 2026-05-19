export const content = {
  title: "Relational Database Fundamentals",
  sections: [
    {
      heading: "What is a Relational Database?",
      body: `A **relational database** stores data in **tables** (also called relations) — structured grids of rows and columns. Every row is one record; every column is one attribute. The "relational" part means tables can be linked to each other through shared values, letting you split data across multiple tables and query it back together with joins.`,
      items: [
        "**Table (relation)** — a named grid of rows and columns, like a spreadsheet with a strict schema",
        "**Row (record/tuple)** — one instance of the entity (one user, one order, one product)",
        "**Column (attribute/field)** — one property of the entity, with a declared data type",
        "**Schema** — the structure definition: table names, column names, types, and constraints",
        "**RDBMS** — Relational Database Management System. The software that stores, manages, and queries data: PostgreSQL, MySQL, SQLite, SQL Server, Oracle",
      ],
    },
    {
      heading: "Primary Keys & Foreign Keys",
      body: `Every table should have a **primary key** — a column (or combination of columns) that uniquely identifies each row. A **foreign key** is a column that references a primary key in another table, creating a relationship between the two.`,
      code: `-- A users table with a primary key
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,   -- auto-incrementing integer, unique per row
  email      TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- An orders table with a foreign key referencing users
CREATE TABLE orders (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),  -- foreign key
  total      NUMERIC(10, 2) NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_id in orders MUST match an existing id in users
-- This enforces referential integrity — no orphan orders`,
      items: [
        "**Primary key** — uniquely identifies each row. Cannot be NULL. Usually an auto-incrementing integer or UUID.",
        "**Foreign key** — a column whose value must exist as a primary key in another table. Enforces referential integrity.",
        "**Composite key** — a primary key made of two or more columns together (common in junction tables)",
        "**Surrogate key** — an artificial key added for uniqueness (e.g., `id SERIAL`)",
        "**Natural key** — a key that exists in the real world (e.g., email, ISBN, SSN) — use carefully, they can change",
      ],
    },
    {
      heading: "Data Types",
      body: `Every column has a **data type** that constrains what values it can hold. Choosing the right type saves storage, prevents invalid data, and enables efficient indexing.`,
      code: `-- Common PostgreSQL data types

-- Integers
id          SERIAL          -- auto-increment int (1, 2, 3...)
id          BIGSERIAL       -- large auto-increment (for high-volume tables)
count       INTEGER         -- -2B to +2B
flags       SMALLINT        -- -32768 to +32767

-- Text
name        TEXT            -- unlimited-length string (preferred in Postgres)
code        VARCHAR(10)     -- max 10 characters
flag        CHAR(2)         -- exactly 2 characters, padded

-- Numbers
price       NUMERIC(10, 2)  -- exact decimal: 10 digits, 2 after the point
score       REAL            -- floating point (approximate, fast)

-- Date / Time
created_at  TIMESTAMPTZ     -- timestamp with timezone (always use this)
birth_date  DATE            -- date only
duration    INTERVAL        -- e.g., '2 hours', '30 days'

-- Boolean
is_active   BOOLEAN         -- TRUE / FALSE / NULL

-- JSON
metadata    JSONB           -- binary JSON (indexable, queryable)

-- UUID
id          UUID DEFAULT gen_random_uuid()  -- globally unique ID`,
    },
    {
      heading: "Why Relational Databases?",
      body: `Relational databases have dominated for 50 years because they solve the hard problems: keeping data consistent, preventing corruption, and enabling flexible querying without knowing the questions in advance.`,
      items: [
        "**ACID transactions** — Atomicity, Consistency, Isolation, Durability. Operations either fully succeed or fully fail — no partial writes.",
        "**Referential integrity** — foreign keys prevent orphaned records and data corruption at the database level, not just in application code",
        "**Flexible querying** — SQL lets you ask arbitrary questions across any combination of columns and tables without pre-planning access patterns",
        "**Normalization** — storing each fact once reduces duplication and inconsistency",
        "**Mature tooling** — decades of battle-tested tools for backups, replication, migrations, monitoring, and optimization",
        "**The default choice** — when in doubt, use PostgreSQL. It handles 99% of production use cases and scales further than most teams need",
      ],
    },
    {
      heading: "Choosing a Database",
      body: `PostgreSQL is the default choice for most production backends. Here's when you'd use each:`,
      items: [
        "**PostgreSQL** — default for production. Full SQL, JSONB, great performance, excellent tooling (Supabase, RDS, Neon)",
        "**MySQL/MariaDB** — common in older stacks, widely supported, slightly simpler replication story",
        "**SQLite** — embedded, file-based, zero setup. Perfect for development, testing, mobile apps, and small tools",
        "**SQL Server** — Microsoft ecosystem, enterprise features, common in .NET shops",
        "**Redis** — not relational, but used alongside SQL for caching, sessions, and queues",
        "**MongoDB** — document store, good for flexible/nested data but lacks joins and strong ACID guarantees",
      ],
    },
  ],
};
