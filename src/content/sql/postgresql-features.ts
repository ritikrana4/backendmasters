export const content = {
  title: "PostgreSQL Features",
  sections: [
    {
      heading: "Why PostgreSQL?",
      body: `PostgreSQL is the default choice for production backends. Beyond standard SQL, it has powerful features that eliminate the need for separate services in many cases: JSON storage, full-text search, arrays, powerful indexing, and a rich extension ecosystem. It's free, open-source, and battle-tested at scale.`,
      items: [
        "**JSONB** — binary JSON stored natively, fully indexable and queryable with operators",
        "**Arrays** — store lists of values in a single column, with array operators and indexing",
        "**Full-text search** — built-in search with tsvector, tsquery, and ranking — no Elasticsearch needed for basic cases",
        "**UPSERT** — INSERT ON CONFLICT handles race conditions cleanly",
        "**RETURNING** — get the inserted/updated rows back without a second query",
        "**Extensions** — pgvector (AI embeddings), PostGIS (geographic queries), pg_trgm (fuzzy search), uuid-ossp",
      ],
    },
    {
      heading: "JSONB — Flexible Schema",
      body: `**JSONB** stores JSON as binary, making it indexable and queryable with operators. Use it for semi-structured or variable-shape data where you don't want a column per field.`,
      code: `-- Store arbitrary JSON in a column
CREATE TABLE products (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL,
  metadata JSONB   -- flexible attributes: {"colour": "red", "weight": 1.5}
);

-- Insert JSON
INSERT INTO products (name, metadata)
VALUES ('Widget', '{"colour": "red", "weight": 1.5, "tags": ["new", "sale"]}');

-- Access JSON fields with -> (returns JSON) or ->> (returns text)
SELECT
  name,
  metadata->>'colour'          AS colour,
  (metadata->>'weight')::float AS weight
FROM products
WHERE metadata->>'colour' = 'red';

-- Nested access
SELECT metadata->'dimensions'->>'height' FROM products;

-- Check if key exists
SELECT * FROM products WHERE metadata ? 'weight';

-- Check if JSON contains a value
SELECT * FROM products WHERE metadata @> '{"colour": "red"}';

-- Array of tags contains 'sale'
SELECT * FROM products WHERE metadata->'tags' ? 'sale';

-- GIN index on JSONB for fast queries
CREATE INDEX idx_products_metadata ON products USING GIN (metadata);

-- Update a JSON field
UPDATE products
SET metadata = jsonb_set(metadata, '{colour}', '"blue"')
WHERE id = 1;`,
    },
    {
      heading: "Arrays",
      body: `PostgreSQL supports **arrays** as a native column type. Useful for storing a list of values (tags, permissions, ids) without needing a separate table.`,
      code: `-- Array column
CREATE TABLE articles (
  id   SERIAL PRIMARY KEY,
  title TEXT,
  tags TEXT[]   -- array of text
);

INSERT INTO articles (title, tags) VALUES
  ('Intro to SQL', ARRAY['sql', 'database', 'beginner']),
  ('Advanced Postgres', ARRAY['sql', 'postgresql', 'advanced']);

-- Query: articles with tag 'sql'
SELECT title FROM articles WHERE 'sql' = ANY(tags);

-- Contains all given tags
SELECT title FROM articles WHERE tags @> ARRAY['sql', 'database'];

-- Overlap: at least one tag in common
SELECT title FROM articles WHERE tags && ARRAY['sql', 'python'];

-- Array length
SELECT title, array_length(tags, 1) AS tag_count FROM articles;

-- Append to array
UPDATE articles SET tags = array_append(tags, 'new') WHERE id = 1;

-- GIN index for fast array queries
CREATE INDEX idx_articles_tags ON articles USING GIN(tags);`,
    },
    {
      heading: "Full-Text Search",
      body: `PostgreSQL has built-in full-text search — no need for Elasticsearch for basic search features. It uses **tsvector** (a pre-processed document) and **tsquery** (a search query with operators).`,
      code: `-- tsvector: normalize text into a set of lexemes
SELECT to_tsvector('english', 'The quick brown fox jumped over lazy dogs');
-- 'brown':3 'dog':8 'fox':4 'jump':5 'lazi':7 'quick':2
-- (stop words removed, words stemmed)

-- tsquery: search terms with operators
SELECT to_tsquery('english', 'quick & fox');     -- AND
SELECT to_tsquery('english', 'fox | cat');       -- OR
SELECT to_tsquery('english', 'fox & !dog');      -- AND NOT
SELECT plainto_tsquery('english', 'quick fox');  -- natural language → AND

-- Full-text search query
SELECT title, body
FROM articles
WHERE to_tsvector('english', title || ' ' || body) @@ to_tsquery('english', 'postgresql & index');

-- Better: store the tsvector in a generated column + index it
ALTER TABLE articles ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,''))
  ) STORED;

CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

-- Fast indexed search
SELECT title FROM articles WHERE search_vector @@ plainto_tsquery('english', 'sql joins');

-- Ranking results by relevance
SELECT title, ts_rank(search_vector, query) AS rank
FROM articles, plainto_tsquery('english', 'sql') query
WHERE search_vector @@ query
ORDER BY rank DESC;`,
    },
    {
      heading: "UUIDs, UPSERT, RETURNING",
      body: `Three PostgreSQL features that show up in almost every production codebase.`,
      code: `-- UUID primary keys (better for distributed systems — no coordination needed)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  payload    JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- UPSERT: insert or update on conflict
INSERT INTO user_settings (user_id, key, value)
VALUES (42, 'theme', 'dark')
ON CONFLICT (user_id, key) DO UPDATE
  SET value      = EXCLUDED.value,
      updated_at = NOW();

-- RETURNING: get inserted/updated row data without a second query
INSERT INTO users (name, email)
VALUES ('Alice', 'alice@example.com')
RETURNING id, created_at;

-- RETURNING in UPDATE
UPDATE orders
SET status = 'shipped', shipped_at = NOW()
WHERE id = 123
RETURNING id, user_id, shipped_at;

-- RETURNING in DELETE
DELETE FROM sessions
WHERE expires_at < NOW()
RETURNING id, user_id;`,
    },
  ],
};
