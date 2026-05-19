export const content = {
  title: "NoSQL Databases",
  sections: [
    {
      heading: "What is NoSQL?",
      body: `**NoSQL** ("not only SQL") is a broad category of databases that don't use the relational table model. They trade SQL's flexibility and strong consistency for different access patterns, horizontal scalability, or schema flexibility. Each NoSQL type is optimized for a specific use case — there's no single "NoSQL database", just different tools for different problems.`,
      items: [
        "**Document stores** — JSON-like documents with flexible schemas: MongoDB, Firestore, CouchDB",
        "**Key-value stores** — simple dictionary lookup, extremely fast: Redis, DynamoDB, Memcached",
        "**Column-family stores** — wide rows optimized for time-series and write-heavy workloads: Apache Cassandra, HBase, ScyllaDB",
        "**Graph databases** — nodes and edges for relationship-heavy data: Neo4j, Amazon Neptune",
        "**Search engines** — inverted indexes for full-text search: Elasticsearch, OpenSearch",
        "**Time-series** — optimized for time-stamped data: InfluxDB, TimescaleDB (Postgres extension)",
      ],
    },
    {
      heading: "Document Stores — MongoDB",
      body: `**Document databases** store records as JSON-like documents (BSON in MongoDB). Documents can have nested objects and arrays — no joins needed for related data that's always accessed together. The schema is flexible: different documents in the same collection can have different fields.`,
      code: `// MongoDB document example
{
  "_id": ObjectId("..."),
  "name": "Alice",
  "email": "alice@example.com",
  "address": {
    "city": "San Francisco",     // embedded document
    "state": "CA"
  },
  "orders": [                    // embedded array
    { "id": 1, "total": 50.00 },
    { "id": 2, "total": 30.00 }
  ],
  "tags": ["premium", "verified"]
}

// Query
db.users.find({ "address.city": "San Francisco" })

// When to use MongoDB:
// ✅ Data naturally has nested structure (product catalogs with varying attributes)
// ✅ Schema changes frequently during development
// ✅ Reads are almost always of the full document (no partial-field queries)
// ❌ You need joins, transactions across multiple collections
// ❌ Data is heavily relational (use PostgreSQL instead)`,
    },
    {
      heading: "Key-Value Stores — Redis",
      body: `**Key-value stores** map a key to a value with extremely fast O(1) lookups. Redis is the most widely used — it's an in-memory data structure server supporting strings, hashes, lists, sets, sorted sets, and more. Used for caching, sessions, queues, and rate limiting.`,
      code: `# Redis commands
SET user:42:name "Alice"        # store a string
GET user:42:name                # retrieve it
DEL user:42:name                # delete

SET session:abc123 "user_data"  EX 3600  # expire in 1 hour
TTL session:abc123              # check remaining TTL

# Hash (like an object)
HSET user:42 name "Alice" email "alice@example.com"
HGET user:42 name
HGETALL user:42

# Sorted set — leaderboard
ZADD leaderboard 1500 "alice" 2300 "bob" 900 "carol"
ZREVRANGE leaderboard 0 2 WITHSCORES  # top 3

# List — message queue
LPUSH jobs "task1"      # push to left
RPOP jobs               # pop from right (FIFO queue)
BRPOP jobs 30           # blocking pop with 30s timeout

# When to use Redis:
# ✅ Caching (DB query results, rendered HTML, API responses)
# ✅ Session storage
# ✅ Rate limiting counters
# ✅ Pub/sub messaging
# ✅ Distributed locks
# ❌ Primary source of truth (in-memory, data can be lost without persistence config)`,
    },
    {
      heading: "Column-Family Stores — Cassandra",
      body: `**Column-family databases** like Apache Cassandra store data in rows, but each row can have a different set of columns. Designed for massive write throughput, geographic distribution, and no single point of failure. Used by Netflix, Instagram, Discord (for messages).`,
      items: [
        "**Wide rows** — a row can have thousands of columns, making it efficient for time-series (timestamps as column names)",
        "**No joins, no transactions** — Cassandra sacrifices SQL's flexibility for linear scalability",
        "**Tunable consistency** — you choose how many replicas must confirm a write/read (ONE, QUORUM, ALL)",
        "**Design for your queries** — unlike SQL, you design the table schema around the specific query you need",
        "**Use cases**: time-series data, activity feeds, IoT sensor data, high-write-rate event logging",
        "**Don't use for**: anything requiring joins, complex queries, or strong ACID transactions",
      ],
    },
    {
      heading: "SQL vs NoSQL — How to Choose",
      body: `The decision isn't "SQL is old" vs "NoSQL is modern" — it's about matching the database to your access patterns, consistency requirements, and scale.`,
      items: [
        "**Use SQL (PostgreSQL) when**: data is relational, you need ACID transactions, query patterns are flexible and not fully known, data integrity is critical",
        "**Use Redis when**: you need caching, sessions, rate limiting, queues, leaderboards — fast in-memory access with TTL",
        "**Use MongoDB when**: schema changes frequently, data is document-shaped with deep nesting, you're prototyping fast",
        "**Use Cassandra when**: write throughput is massive (millions/sec), you need multi-region active-active, and query patterns are simple and known upfront",
        "**Use Elasticsearch when**: you need full-text search with relevance ranking, faceted filtering, or log/event analytics",
        "**The reality**: most production backends use PostgreSQL as primary + Redis for caching/sessions. Start there.",
      ],
    },
    {
      heading: "CAP Theorem & NoSQL Trade-offs",
      body: `The **CAP theorem** states that a distributed system can guarantee at most two of: Consistency, Availability, Partition tolerance. Since network partitions are unavoidable, you choose between consistency and availability.`,
      items: [
        "**CP systems** (Consistency + Partition tolerance): returns an error or timeout if it can't guarantee consistent data. Examples: HBase, Zookeeper, MongoDB (with write concern).",
        "**AP systems** (Availability + Partition tolerance): always responds but may return stale data. Examples: Cassandra, CouchDB, DynamoDB (eventually consistent mode).",
        "**CA systems** (Consistency + Availability): only possible without network partitions — single-node databases. Traditional RDBMS in a single-region deployment.",
        "SQL databases in a single-node or synchronous-replica setup are effectively CA — they sacrifice availability to stay consistent during a partition.",
        "The choice depends on your application: would you rather show stale data or show an error?",
      ],
    },
  ],
};
