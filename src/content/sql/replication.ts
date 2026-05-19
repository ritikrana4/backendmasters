export const content = {
  title: "Replication & Read Replicas",
  sections: [
    {
      heading: "Why Replication?",
      body: `A single PostgreSQL instance can handle a lot, but as read traffic grows — analytics queries, reporting, full-text search — it can overwhelm the primary. **Replication** copies data from a **primary** (write) to one or more **replicas** (read-only), letting you route read queries to replicas and scale read capacity independently.

Replication also provides **high availability**: if the primary fails, a replica can be promoted to take over.`,
      items: [
        "**Read scaling**: route SELECT queries to replicas, writes to the primary",
        "**High availability**: promote a replica if the primary goes down (failover)",
        "**Backup without impact**: run pg_dump against a replica so it doesn't affect primary performance",
        "**Analytics isolation**: run slow analytical queries on a dedicated replica without impacting the OLTP primary",
        "**Replication lag**: replicas are slightly behind the primary. Recent writes may not yet be visible on a replica — this is **eventual consistency**.",
      ],
    },
    {
      heading: "Streaming Replication",
      body: `PostgreSQL's built-in **streaming replication** ships WAL (Write-Ahead Log) records from the primary to replicas in near real-time. The replica replays the WAL to stay in sync.`,
      code: `-- On the PRIMARY: configure replication

-- postgresql.conf
wal_level = replica           -- include enough detail for replication
max_wal_senders = 5           -- max concurrent replication connections
wal_keep_size = 256MB         -- keep WAL for replicas that fall behind

-- Create a replication user
CREATE USER replicator REPLICATION LOGIN PASSWORD 'strong_password';

-- pg_hba.conf — allow replication connections from replica IPs
host replication replicator 10.0.1.11/32 scram-sha-256

-- On the REPLICA: bootstrap from primary
pg_basebackup -h 10.0.1.10 -U replicator -D /var/lib/postgresql/data -P -R
# -R writes postgresql.auto.conf with primary_conninfo automatically

-- postgresql.auto.conf (written by pg_basebackup -R)
primary_conninfo = 'host=10.0.1.10 port=5432 user=replicator password=strong_password'

-- Start the replica; it will stream WAL from primary automatically

-- Check replication status on primary:
SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn,
       (sent_lsn - replay_lsn) AS replication_lag_bytes
FROM pg_stat_replication;`,
    },
    {
      heading: "Synchronous vs Asynchronous Replication",
      body: `By default, PostgreSQL uses **asynchronous replication**: the primary commits a transaction and returns to the client immediately, without waiting for the replica to confirm receipt. This means a primary crash could lose the last few transactions.

**Synchronous replication** waits for at least one replica to confirm before the primary acknowledges the commit — no data loss, but higher write latency.`,
      code: `-- Asynchronous (default): primary commits immediately
-- Risk: if primary crashes, replica may be slightly behind (RPO > 0)
-- Benefit: no added write latency

-- Synchronous: primary waits for replica(s) to confirm WAL receipt
-- postgresql.conf on primary:
synchronous_standby_names = 'ANY 1 (replica1, replica2)'
-- Waits for any 1 of the named replicas to acknowledge before commit
-- RPO = 0 (no data loss) but adds ~1-2ms of network RTT to each write

-- Check replication lag (bytes and time)
SELECT
    client_addr,
    state,
    sync_state,                          -- 'sync' or 'async'
    now() - pg_last_xact_replay_timestamp() AS replication_delay
FROM pg_stat_replication;

-- On a replica — check how far behind it is:
SELECT now() - pg_last_xact_replay_timestamp() AS lag;

-- Handling lag in your application:
# Read recent writes from primary; older reads from replica
def get_user(user_id: int, just_written: bool = False):
    conn = primary_conn if just_written else replica_conn
    return conn.execute("SELECT * FROM users WHERE id = %s", [user_id]).fetchone()`,
    },
    {
      heading: "Routing Reads to Replicas",
      body: `Your application needs to know when to use the primary vs a replica. The key rule: **send writes to the primary; route reads to replicas only for data that can tolerate lag**.`,
      code: `import psycopg2
from contextlib import contextmanager

PRIMARY = {"host": "db-primary", "port": 5432, "dbname": "app"}
REPLICAS = [
    {"host": "db-replica-1", "port": 5432, "dbname": "app"},
    {"host": "db-replica-2", "port": 5432, "dbname": "app"},
]

_replica_index = 0

def get_replica_conn():
    """Round-robin across replicas."""
    global _replica_index
    config = REPLICAS[_replica_index % len(REPLICAS)]
    _replica_index += 1
    return psycopg2.connect(**config)

def get_primary_conn():
    return psycopg2.connect(**PRIMARY)

# Usage patterns:

# 1. Write → always primary
def create_order(user_id: int, amount: float):
    with get_primary_conn() as conn:
        conn.execute("INSERT INTO orders (user_id, amount) VALUES (%s, %s)", [user_id, amount])
        conn.commit()

# 2. Read-after-write → primary (replica lag could show stale data)
def get_order_just_created(order_id: int):
    with get_primary_conn() as conn:
        return conn.execute("SELECT * FROM orders WHERE id = %s", [order_id]).fetchone()

# 3. Latency-tolerant reads → replica
def get_monthly_report(month: str):
    with get_replica_conn() as conn:
        return conn.execute(
            "SELECT date_trunc('day', created_at), SUM(amount) FROM orders "
            "WHERE created_at >= %s GROUP BY 1", [month]
        ).fetchall()`,
    },
    {
      heading: "Failover & Promotion",
      body: `When the primary fails, a replica must be **promoted** to become the new primary. This can be manual or automated with tools like Patroni or AWS RDS Multi-AZ.`,
      items: [
        "**Manual promotion**: `pg_ctl promote -D /var/lib/postgresql/data` on the replica. Then redirect your application's primary connection string.",
        "**Patroni**: open-source HA manager. Uses etcd/Consul for leader election, automatically promotes the best replica, and updates your load balancer.",
        "**AWS RDS Multi-AZ**: managed synchronous standby in a different AZ. Failover is automatic in ~30–60s. No data loss (synchronous).",
        "**Point-in-Time Recovery (PITR)**: restore the database to any moment using base backups + WAL archives. Essential for recovering from accidental data deletion.",
        "**RTO vs RPO**: Recovery Time Objective (how long can the system be down) vs Recovery Point Objective (how much data can be lost). Synchronous replication gives RPO=0; async gives RPO of seconds.",
      ],
    },
  ],
  starterCode: `# Simulating replication lag and read routing

import time
import random

class PrimaryDB:
    """Simulates a primary database that also ships writes to replicas."""
    def __init__(self):
        self.data: dict[int, dict] = {}
        self.replicas: list["ReplicaDB"] = []
        self.lsn = 0   # log sequence number

    def write(self, user_id: int, name: str):
        self.lsn += 1
        record = {"id": user_id, "name": name, "lsn": self.lsn}
        self.data[user_id] = record
        # Ship WAL to replicas asynchronously (with simulated lag)
        for replica in self.replicas:
            replica.receive_wal(record, lag_ms=random.randint(5, 50))
        print(f"[primary] wrote user {user_id} at LSN {self.lsn}")
        return record

    def read(self, user_id: int):
        return self.data.get(user_id)

class ReplicaDB:
    def __init__(self, name: str):
        self.name = name
        self.data: dict[int, dict] = {}
        self.applied_lsn = 0

    def receive_wal(self, record: dict, lag_ms: int):
        # Simulate lag — in reality this is network + apply time
        time.sleep(lag_ms / 1000)
        self.data[record["id"]] = record
        self.applied_lsn = record["lsn"]

    def read(self, user_id: int):
        return self.data.get(user_id)

primary = PrimaryDB()
replica1 = ReplicaDB("replica-1")
primary.replicas.append(replica1)

# Write to primary
primary.write(1, "Alice")

# Read immediately from replica — may show stale data
result = replica1.read(1)
print(f"[replica] read after write: {result}")
# On a real system, add a small delay or read from primary for fresh data
`,
};
