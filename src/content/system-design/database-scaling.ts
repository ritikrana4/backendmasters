import type { DiagramConfig } from "@/components/FlowDiagram";

const dbDiagram: DiagramConfig = {
  width: 760,
  height: 230,
  caption: "Write traffic goes to the primary; read traffic is distributed across read replicas via a proxy or connection string",
  nodes: [
    { id: "wrt",  type: "client",   label: "Writes",      x: 75,  y: 70  },
    { id: "rds",  type: "client",   label: "Reads",       x: 75,  y: 165 },
    { id: "pri",  type: "database", label: "Primary DB",  x: 290, y: 115 },
    { id: "r1",   type: "database", label: "Replica 1",   sublabel: "read-only", x: 530, y: 60  },
    { id: "r2",   type: "database", label: "Replica 2",   sublabel: "read-only", x: 530, y: 165 },
    { id: "pgb",  type: "proxy",    label: "PgBouncer",   sublabel: "pool", x: 690, y: 115 },
  ],
  edges: [
    { from: "wrt", to: "pri" },
    { from: "rds", to: "r1" },
    { from: "rds", to: "r2" },
    { from: "pri", to: "r1", label: "WAL stream", dashed: true },
    { from: "pri", to: "r2", label: "WAL stream", dashed: true },
    { from: "r1",  to: "pgb" },
    { from: "r2",  to: "pgb" },
  ],
};

export const content = {
  title: "Database Scaling Patterns",
  sections: [
    {
      heading: "Read Replicas",
      diagram: dbDiagram,
      body: `The first and most common database scaling technique: **read replicas**. The primary handles all writes; one or more read-only replicas stream the WAL (write-ahead log) and stay in sync. Read traffic is distributed across replicas — multiplying read capacity without touching the primary.

This works because most production workloads are read-heavy (80–90% reads, 10–20% writes). Read replicas can also handle analytical queries and reporting without impacting OLTP performance on the primary.`,
      items: [
        "**Replication lag**: replicas are slightly behind the primary (typically milliseconds for async replication). Recent writes may not yet appear on a replica.",
        "**Read-after-write consistency**: if a user writes and immediately reads, route that read to the primary to guarantee they see their own write.",
        "**Replica for analytics**: run slow reporting queries on a dedicated replica. Avoids locking and I/O pressure on the primary.",
        "**Connection pooling**: use PgBouncer in front of both primary and replicas. Opens a small number of real DB connections and multiplexes application connections — avoids exhausting PostgreSQL's `max_connections`.",
      ],
    },
    {
      heading: "Sharding (Horizontal Partitioning)",
      body: `When a single primary can't handle write throughput, **sharding** splits the data across multiple independent database instances. Each shard holds a partition of the data (e.g., users A–M on shard 1, users N–Z on shard 2). The application or a proxy routes queries to the correct shard.`,
      code: `# Application-level sharding by user ID
NUM_SHARDS = 4

SHARD_CONNS = {
    0: connect("db-shard-0:5432"),
    1: connect("db-shard-1:5432"),
    2: connect("db-shard-2:5432"),
    3: connect("db-shard-3:5432"),
}

def shard_for(user_id: int) -> int:
    return user_id % NUM_SHARDS

def get_orders(user_id: int) -> list:
    db = SHARD_CONNS[shard_for(user_id)]
    return db.execute("SELECT * FROM orders WHERE user_id = %s", [user_id])

def create_order(user_id: int, amount: float):
    db = SHARD_CONNS[shard_for(user_id)]
    db.execute("INSERT INTO orders (user_id, amount) VALUES (%s, %s)", [user_id, amount])

# Cross-shard query (expensive — hits all shards)
def total_revenue() -> float:
    total = 0
    for db in SHARD_CONNS.values():
        total += db.execute("SELECT SUM(amount) FROM orders").scalar()
    return total

# Managed sharding alternatives:
# Citus (Postgres extension) — handles routing transparently
# PlanetScale (MySQL-compatible) — branch-based sharding
# CockroachDB — distributed SQL, automatic sharding`,
    },
    {
      heading: "Vertical Partitioning & Federation",
      body: `**Vertical partitioning** (federation) splits the database by domain rather than by row. Instead of one large database, each domain gets its own: users DB, orders DB, payments DB. This is the database equivalent of microservices.`,
      items: [
        "**Reduces connections per DB**: each service only connects to its own database — smaller connection pool, smaller index memory footprint.",
        "**Independent scaling**: the orders DB can be scaled to handle flash sale writes without touching the users DB.",
        "**No cross-database JOINs**: once federated, you can't JOIN users and orders at the DB layer. Must be done in application code via API calls — similar to microservices communication.",
        "**Start here before sharding**: federation is operationally simpler than sharding. Each DB is a standard PostgreSQL instance with standard tooling.",
        "**CQRS (Command Query Responsibility Segregation)**: a pattern that pairs well with federation. Separate write models (normalised, transactional) from read models (denormalised, optimised for queries). Events sync them.",
      ],
    },
    {
      heading: "Choosing SQL vs NoSQL at Scale",
      body: `The choice isn't about scale — PostgreSQL with read replicas handles billions of rows. It's about **data model fit** and **consistency requirements**.`,
      code: `# Use PostgreSQL (relational) when:
# - Data is relational (users, orders, products with FK relationships)
# - ACID transactions are required (financial data, inventory)
# - Query patterns are complex or ad hoc (JOINs, aggregations)
# - Schema is relatively stable

# Use Cassandra / DynamoDB (wide-column / key-value) when:
# - Write throughput is extreme (millions of events/second)
# - Data model is simple and access patterns are well-defined upfront
# - Availability is more important than consistency
# - Time-series or append-only workloads (logs, events, metrics)

# Use Redis when:
# - Data fits in memory
# - Operations are simple (get/set/expire, sorted sets, pub/sub)
# - Use cases: caching, session storage, leaderboards, rate limiting

# Use Elasticsearch when:
# - Full-text search is the primary access pattern
# - Log aggregation and analytics
# - NOT for your primary data store — sync from Postgres via CDC

# Use S3 / object storage when:
# - Storing files, images, video, backups, ML datasets
# - Unlimited scale, zero ops, ~$0.023/GB-month`,
    },
  ],
};
