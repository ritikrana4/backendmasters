export const content = {
  title: "Relationships & Junction Tables",
  sections: [
    {
      heading: "One-to-Many",
      body: `A **one-to-many** relationship is the most common: one row in table A relates to many rows in table B. A user has many orders. A post has many comments. Implemented with a foreign key on the "many" side pointing to the "one" side.`,
      code: `-- One user → many orders (foreign key on the orders side)
CREATE TABLE users (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE orders (
  id      SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total   NUMERIC(10,2),
  status  TEXT DEFAULT 'pending'
);

-- Query: all orders for user 42
SELECT * FROM orders WHERE user_id = 42;

-- Query: users with their order count
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;`,
    },
    {
      heading: "One-to-One",
      body: `A **one-to-one** relationship means each row in A relates to at most one row in B. Used to split a large table (separate required from optional fields) or to extend a table without modifying it.`,
      code: `-- User and user_profile: split required auth fields from optional profile data
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  email        TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

CREATE TABLE user_profiles (
  user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  -- PK + FK = ensures one profile per user
  bio        TEXT,
  avatar_url TEXT,
  website    TEXT
);

-- Query: join user with their profile
SELECT u.email, p.bio, p.avatar_url
FROM users u
LEFT JOIN user_profiles p ON p.user_id = u.id
WHERE u.id = 42;

-- Another pattern: add UNIQUE to the FK column
CREATE TABLE passports (
  id      SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
  number  TEXT NOT NULL
);`,
    },
    {
      heading: "Many-to-Many & Junction Tables",
      body: `A **many-to-many** relationship (a post has many tags, a tag belongs to many posts) cannot be expressed with a simple foreign key. It requires a **junction table** (also called a join table or association table) with foreign keys to both sides.`,
      code: `-- Posts ↔ Tags: many-to-many
CREATE TABLE posts (
  id    SERIAL PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE tags (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Junction table
CREATE TABLE post_tags (
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  INTEGER REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)  -- composite PK prevents duplicates
);

-- Index both FKs for fast lookups in either direction
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);

-- Query: all tags for post 1
SELECT t.name
FROM tags t
JOIN post_tags pt ON pt.tag_id = t.id
WHERE pt.post_id = 1;

-- Query: all posts with tag 'python'
SELECT p.title
FROM posts p
JOIN post_tags pt ON pt.post_id = p.id
JOIN tags t       ON t.id       = pt.tag_id
WHERE t.name = 'python';

-- Junction table with extra data (adding metadata to the relationship)
CREATE TABLE team_members (
  team_id  INTEGER REFERENCES teams(id),
  user_id  INTEGER REFERENCES users(id),
  role     TEXT NOT NULL DEFAULT 'member',  -- 'admin', 'member', 'viewer'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);`,
    },
    {
      heading: "Self-Referential Relationships",
      body: `A **self-referential** (recursive) relationship is when a table references itself. Common for hierarchies: employees → managers, categories → subcategories, comments → replies.`,
      code: `-- Employee hierarchy
CREATE TABLE employees (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  manager_id INTEGER REFERENCES employees(id)  -- NULL for the root (CEO)
);

-- Category tree
CREATE TABLE categories (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  parent_id INTEGER REFERENCES categories(id)  -- NULL for top-level categories
);

-- Threaded comments (replies to comments)
CREATE TABLE comments (
  id        SERIAL PRIMARY KEY,
  post_id   INTEGER NOT NULL REFERENCES posts(id),
  parent_id INTEGER REFERENCES comments(id),  -- NULL = top-level comment
  body      TEXT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES users(id)
);

-- Query: direct reports of employee 5
SELECT e.name
FROM employees e
WHERE e.manager_id = 5;

-- Query: full hierarchy (use recursive CTE for multi-level)
WITH RECURSIVE org_chart AS (
  SELECT id, name, manager_id, 0 AS depth
  FROM employees WHERE manager_id IS NULL  -- start at CEO

  UNION ALL

  SELECT e.id, e.name, e.manager_id, oc.depth + 1
  FROM employees e
  JOIN org_chart oc ON e.manager_id = oc.id
)
SELECT name, depth FROM org_chart ORDER BY depth, name;`,
    },
    {
      heading: "Polymorphic Associations",
      body: `A **polymorphic association** is when one table relates to multiple other tables through the same columns — a comment that can belong to either a post or a video. Use with care — it sacrifices foreign key constraints. Concrete table inheritance is usually safer.`,
      code: `-- Polymorphic: likes can target posts OR comments
-- ⚠ commentable_type + commentable_id breaks FK enforcement
CREATE TABLE likes (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id),
  likeable_type    TEXT NOT NULL,  -- 'post' or 'comment'
  likeable_id      INTEGER NOT NULL,
  -- No FK on likeable_id — can't point to two tables
  UNIQUE (user_id, likeable_type, likeable_id)
);

-- Better: separate tables per relationship (concrete associations)
CREATE TABLE post_likes (
  user_id INTEGER REFERENCES users(id),
  post_id INTEGER REFERENCES posts(id),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE comment_likes (
  user_id    INTEGER REFERENCES users(id),
  comment_id INTEGER REFERENCES comments(id),
  PRIMARY KEY (user_id, comment_id)
);
-- Harder to query across both, but FK integrity is maintained`,
    },
  ],
};
