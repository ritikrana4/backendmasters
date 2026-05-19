export const content = {
  title: "Partitioning & Sharding",
  sections: [
    {
      heading: "Why Partition or Shard?",
      body: `As tables grow to hundreds of millions of rows, queries slow down, indexes bloat, and VACUUM struggles to keep up. **Partitioning** splits a single large table into smaller physical pieces (within one PostgreSQL instance) while keeping the logical table interface intact. **Sharding** distributes data across multiple database instances — it's a last resort for scale that exceeds what a single server can handle.

Start with partitioning. Sharding introduces enormous operational complexity and should only be considered after optimising queries, adding indexes, and vertically scaling the database.`,
      items: [
        "**Partition pruning**: PostgreSQL automatically skips partitions that can't contain matching rows — a query on one month's data doesn't touch the other 11 months",
        "**Faster VACUUM**: each partition is vacuumed independently; dropping old data means `DROP TABLE` on a partition instead of slow `DELETE` + VACUUM",
        "**Index size**: indexes on a partition are smaller than a global index on the full table — faster to build and maintain",
        "**Sharding**: each shard is a separate DB instance; the application (or a proxy like Citus) routes queries to the right shard",
      ],
    },
    {
      heading: "Range Partitioning",
      body: `**Range partitioning** divides rows based on a continuous range of values — most commonly a date/time column. It's ideal for time-series data: logs, events, orders.`,
      code: `-- Create a range-partitioned table (partitioned by month)
CREATE TABLE orders (
    id          BIGSERIAL,
    user_id     BIGINT NOT NULL,
    amount      NUMERIC(10, 2) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

-- Create partitions for each month
CREATE TABLE orders_2024_01 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE orders_2024_02 PARTITION OF orders
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

CREATE TABLE orders_2024_03 PARTITION OF orders
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

-- PostgreSQL automatically routes INSERT to the correct partition
INSERT INTO orders (user_id, amount, created_at)
VALUES (42, 99.99, '2024-02-15');
-- → goes into orders_2024_02

-- Query with partition pruning — only reads orders_2024_02
SELECT * FROM orders
WHERE created_at BETWEEN '2024-02-01' AND '2024-03-01'
  AND user_id = 42;

-- Dropping old data is instant (no DELETE/VACUUM needed)
DROP TABLE orders_2023_01;   -- removes partition entirely

-- Automate partition creation (run monthly via pg_cron)
CREATE TABLE orders_2024_04 PARTITION OF orders
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');`,
    },
    {
      heading: "Hash & List Partitioning",
      body: `**Hash partitioning** distributes rows evenly by hashing a column — useful when there's no natural range (e.g. user IDs). **List partitioning** assigns specific values to each partition — useful for categorical data like region or status.`,
      code: `-- Hash partitioning — distribute users evenly across 4 partitions
CREATE TABLE users (
    id      BIGSERIAL,
    email   TEXT NOT NULL,
    name    TEXT NOT NULL
) PARTITION BY HASH (id);

CREATE TABLE users_p0 PARTITION OF users FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE users_p1 PARTITION OF users FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE users_p2 PARTITION OF users FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE users_p3 PARTITION OF users FOR VALUES WITH (MODULUS 4, REMAINDER 3);
-- user id=42: 42 % 4 = 2 → goes into users_p2
-- user id=7:  7  % 4 = 3 → goes into users_p3

-- List partitioning — partition by region
CREATE TABLE events (
    id      BIGSERIAL,
    region  TEXT NOT NULL,
    payload JSONB
) PARTITION BY LIST (region);

CREATE TABLE events_us   PARTITION OF events FOR VALUES IN ('us-east', 'us-west');
CREATE TABLE events_eu   PARTITION OF events FOR VALUES IN ('eu-west', 'eu-central');
CREATE TABLE events_apac PARTITION OF events FOR VALUES IN ('ap-southeast', 'ap-northeast');

-- Default partition catches anything not explicitly listed
CREATE TABLE events_other PARTITION OF events DEFAULT;`,
    },
    {
      heading: "Application-Level Sharding",
      body: `When a single PostgreSQL instance (even with partitioning) can't keep up — usually above ~10TB or very high write throughput — you need to split data across multiple database instances. The application determines which shard to query based on a **shard key**.`,
      code: `# Application-level sharding
# Each shard is a completely separate PostgreSQL instance

SHARDS = {
    0: {"host": "db-shard-0", "port": 5432},
    1: {"host": "db-shard-1", "port": 5432},
    2: {"host": "db-shard-2", "port": 5432},
    3: {"host": "db-shard-3", "port": 5432},
}
NUM_SHARDS = len(SHARDS)

def get_shard(user_id: int) -> int:
    """Determine which shard owns this user_id."""
    return user_id % NUM_SHARDS

def get_db_conn(user_id: int):
    shard_id = get_shard(user_id)
    config = SHARDS[shard_id]
    return connect(config["host"], config["port"])

# All data for user_id=42 lives on shard 42 % 4 = 2
# Queries are fast — they only touch one shard

def get_user_orders(user_id: int):
    conn = get_db_conn(user_id)
    return conn.execute(
        "SELECT * FROM orders WHERE user_id = %s", [user_id]
    ).fetchall()

# Cross-shard query (expensive — avoid or redesign)
def get_all_orders_above(amount: float):
    results = []
    for shard_id, config in SHARDS.items():
        conn = connect(config["host"], config["port"])
        results += conn.execute(
            "SELECT * FROM orders WHERE amount > %s", [amount]
        ).fetchall()
    return results   # must query all 4 shards`,
    },
    {
      heading: "Sharding Trade-offs & Pitfalls",
      body: `Sharding solves scale problems but creates operational complexity that is extremely difficult to reverse. Know the costs before committing.`,
      items: [
        "**Cross-shard joins are expensive**: if users and orders live on different shards, a JOIN requires pulling data from multiple machines — often done in application code",
        "**Resharding is painful**: adding a shard means moving data around. Consistent hashing minimises data movement when adding nodes, but it's still complex.",
        "**No cross-shard transactions**: ACID transactions don't span shards. You need distributed transaction protocols (2PC) or eventual consistency — both are hard.",
        "**Choose the shard key carefully**: a bad key (e.g. created_at) creates hotspots — all writes go to one shard. User ID or entity ID distributes load evenly.",
        "**Alternatives to sharding**: vertical scaling (bigger machine), read replicas for read-heavy load, Citus (sharding extension for Postgres that handles routing transparently), or moving analytical workloads to a data warehouse.",
        "**When to actually shard**: most applications never need it. Optimise queries, add indexes, add replicas, and scale vertically first. Shard only when you've exhausted those options.",
      ],
    },
  ],
  starterCode: `# Partitioning simulation — range partitioning by month

from datetime import datetime

class RangePartition:
    def __init__(self, name: str, start: str, end: str):
        self.name = name
        self.start = datetime.fromisoformat(start)
        self.end = datetime.fromisoformat(end)
        self.rows: list[dict] = []

    def accepts(self, ts: datetime) -> bool:
        return self.start <= ts < self.end

    def insert(self, row: dict):
        self.rows.append(row)

class PartitionedTable:
    def __init__(self, partitions: list[RangePartition]):
        self.partitions = partitions

    def insert(self, row: dict):
        ts = datetime.fromisoformat(row["created_at"])
        for p in self.partitions:
            if p.accepts(ts):
                p.insert(row)
                return
        raise ValueError(f"No partition for {row['created_at']}")

    def query(self, start: str, end: str) -> list[dict]:
        """Partition pruning: only scan relevant partitions."""
        s = datetime.fromisoformat(start)
        e = datetime.fromisoformat(end)
        results = []
        for p in self.partitions:
            if p.end > s and p.start < e:  # partition overlaps range
                print(f"  scanning partition: {p.name}")
                results += [r for r in p.rows
                            if s <= datetime.fromisoformat(r["created_at"]) < e]
            else:
                print(f"  pruned partition:   {p.name}")
        return results

table = PartitionedTable([
    RangePartition("orders_2024_01", "2024-01-01", "2024-02-01"),
    RangePartition("orders_2024_02", "2024-02-01", "2024-03-01"),
    RangePartition("orders_2024_03", "2024-03-01", "2024-04-01"),
])

for row in [
    {"id": 1, "user_id": 1, "amount": 50.0,  "created_at": "2024-01-15"},
    {"id": 2, "user_id": 2, "amount": 75.0,  "created_at": "2024-02-10"},
    {"id": 3, "user_id": 1, "amount": 100.0, "created_at": "2024-02-28"},
    {"id": 4, "user_id": 3, "amount": 25.0,  "created_at": "2024-03-05"},
]:
    table.insert(row)

print("Query Feb only — should prune Jan and Mar:")
results = table.query("2024-02-01", "2024-03-01")
print(f"Found {len(results)} rows\\n")
`,
};
