import type { DiagramConfig } from "@/components/FlowDiagram";

const capDiagram: DiagramConfig = {
  width: 640,
  height: 210,
  caption: "Three nodes in a distributed cluster — a network partition between any two nodes forces a choice between consistency and availability",
  nodes: [
    { id: "n1", type: "database", label: "Node A",  sublabel: "primary", x: 110, y: 105 },
    { id: "n2", type: "database", label: "Node B",  sublabel: "replica", x: 380, y: 50  },
    { id: "n3", type: "database", label: "Node C",  sublabel: "replica", x: 380, y: 165 },
    { id: "cl", type: "client",   label: "Client",  x: 570, y: 105 },
  ],
  edges: [
    { from: "n1", to: "n2", label: "replicate" },
    { from: "n1", to: "n3", label: "replicate" },
    { from: "n2", to: "n3" },
    { from: "cl", to: "n2" },
    { from: "cl", to: "n3" },
  ],
};

export const content = {
  title: "CAP Theorem",
  sections: [
    {
      heading: "Consistency, Availability, Partition Tolerance",
      diagram: capDiagram,
      body: `The **CAP theorem** (Brewer, 2000) states that a distributed system can guarantee at most two of three properties simultaneously:

**Consistency (C)**: every read receives the most recent write or an error — no stale data.
**Availability (A)**: every request receives a response (not necessarily the latest data) — the system never returns an error.
**Partition Tolerance (P)**: the system continues operating even when network messages between nodes are lost or delayed.

In a real distributed system, **network partitions are inevitable** — network cables fail, switches drop packets, data centres lose connectivity. So the real choice is between C and A during a partition.`,
      items: [
        "**CP systems**: sacrifice availability during a partition. Nodes refuse to respond rather than return potentially stale data. Examples: ZooKeeper, HBase, etcd, MongoDB (with majority write concern).",
        "**AP systems**: sacrifice consistency during a partition. Nodes continue responding with possibly stale data; reconcile conflicts after the partition heals. Examples: Cassandra, DynamoDB, CouchDB, DNS.",
        "**CA (no partition tolerance)**: theoretically possible only in a single-node or trusted-network system. Not realistic for distributed systems — any two-node system over a real network can partition.",
        "**After the partition heals**: both CP and AP systems need a reconciliation strategy — how do you merge divergent writes? Most AP systems use last-write-wins, vector clocks, or CRDTs.",
      ],
    },
    {
      heading: "PACELC — The Extended Model",
      body: `CAP only describes behaviour during a partition. **PACELC** (Daniel Abadi, 2012) extends it: **if there is a Partition (P)**, choose between **A**vailability and **C**onsistency; **e**lse (normal operation), choose between **L**atency and **C**onsistency.

Even without partitions, synchronous replication (strong consistency) adds latency. Asynchronous replication (eventual consistency) is faster but may return stale reads.`,
      code: `# Cassandra: AP/EL — tune consistency vs latency per query
from cassandra.cluster import Cluster
from cassandra.policies import ConsistencyLevel

cluster = Cluster(["10.0.1.1", "10.0.1.2", "10.0.1.3"])
session = cluster.connect("myapp")

# Strong consistency — wait for quorum of replicas
# Latency ↑, Consistency ↑
session.default_consistency_level = ConsistencyLevel.QUORUM

# Eventual consistency — respond from any one replica
# Latency ↓, may return stale data
session.default_consistency_level = ConsistencyLevel.ONE

# Per-query override: use QUORUM for writes, ONE for reads
# Achieves read-your-writes for most cases at lower overall latency
write_stmt = session.prepare("INSERT INTO users ... USING CONSISTENCY QUORUM")
read_stmt  = session.prepare("SELECT * FROM users ... USING CONSISTENCY ONE")

# Tunable consistency: QUORUM = majority (N/2 + 1 of replicas)
# RF=3 → QUORUM = 2 replicas must acknowledge
# Guarantees you overlap with the most recent write`,
    },
    {
      heading: "Real Systems and Their Trade-offs",
      body: `Most modern databases don't fit neatly into CP or AP — they let you tune the trade-off at query time. Understanding this helps you pick the right database and configure it correctly.`,
      items: [
        "**PostgreSQL with synchronous replication**: CP — a commit waits for the replica to confirm, so reads on the replica are always consistent. Write latency increases by one network RTT.",
        "**PostgreSQL with async replication (default)**: AP — the primary commits immediately; the replica may lag by milliseconds. Reads on the replica may be slightly stale.",
        "**Redis Cluster**: AP — partitioned nodes continue serving reads from their local data. Cross-slot transactions aren't possible. Eventual consistency across slots.",
        "**DynamoDB**: default AP (eventual consistency reads), opt-in CP (strongly consistent reads cost 2x). Strong consistency adds latency.",
        "**ZooKeeper / etcd**: CP — used for leader election and distributed locks precisely because they prioritise consistency over availability. A minority partition will refuse reads/writes.",
        "**DNS**: classic AP — DNS servers continue returning (potentially stale) records during a partition. Eventual consistency via TTL expiry and propagation.",
      ],
    },
    {
      heading: "Eventual Consistency in Practice",
      body: `**Eventual consistency** means that if no new writes occur, all replicas will *eventually* converge to the same value. The key questions are: how long does convergence take, and how do you handle conflicting writes?`,
      code: `# Conflict resolution strategies

# 1. Last-Write-Wins (LWW) — simplest, most common
# Each write has a timestamp; the highest timestamp wins on conflict
# Risk: clock skew can cause newer writes to be overwritten by older ones
{ "user_id": 42, "name": "Alice", "ts": 1716090000 }   # wins over ts=1716089990

# 2. Vector clocks — track causality, not just time
# Each node increments its own counter on write
# {"A": 3, "B": 2} happened-after {"A": 2, "B": 2} — no conflict
# {"A": 3, "B": 2} and {"A": 2, "B": 3} are concurrent — conflict, need resolution

# 3. CRDTs (Conflict-free Replicated Data Types)
# Data structures that merge automatically with no conflicts
# Example: G-Counter (grow-only counter) — each node tracks its own count
class GCounter:
    def __init__(self, node_id: str):
        self.counts = {node_id: 0}
        self.node_id = node_id

    def increment(self):
        self.counts[self.node_id] += 1

    def merge(self, other: "GCounter"):
        for node, count in other.counts.items():
            self.counts[node] = max(self.counts.get(node, 0), count)

    def value(self) -> int:
        return sum(self.counts.values())
# Two nodes can independently increment and merge without conflict`,
    },
  ],
};
