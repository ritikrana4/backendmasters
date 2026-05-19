import type { DiagramConfig } from "@/components/FlowDiagram";

const hashDiagram: DiagramConfig = {
  width: 720,
  height: 200,
  caption: "Consistent hashing: requests are mapped to the nearest node clockwise on the hash ring",
  nodes: [
    { id: "req",  type: "client",   label: "Request",     sublabel: "hash(key)", x: 75,  y: 100 },
    { id: "ring", type: "proxy",    label: "Hash Ring",   sublabel: "0 → 2³²",   x: 300, y: 100 },
    { id: "na",   type: "database", label: "Node A",      sublabel: "pos 90°",   x: 540, y: 45  },
    { id: "nb",   type: "database", label: "Node B",      sublabel: "pos 180°",  x: 540, y: 100 },
    { id: "nc",   type: "database", label: "Node C",      sublabel: "pos 270°",  x: 540, y: 155 },
  ],
  edges: [
    { from: "req",  to: "ring" },
    { from: "ring", to: "na" },
    { from: "ring", to: "nb" },
    { from: "ring", to: "nc" },
  ],
};

export const content = {
  title: "Consistent Hashing",
  sections: [
    {
      heading: "The Problem with Simple Modulo Hashing",
      diagram: hashDiagram,
      body: `The naive way to distribute data across N nodes: \`hash(key) % N\`. If you have 3 nodes, key "user:42" maps to node \`hash("user:42") % 3 = 1\`. This works fine — until you add or remove a node.

When N changes to 4, almost every key remaps: \`hash(key) % 4\` gives a completely different distribution. For a cache cluster, this invalidates nearly all entries (a **mass cache miss**). For a database, it requires moving almost all data.`,
      items: [
        "**Adding 1 node to N=3** invalidates ~75% of keys (3/4 of all keys change their target node).",
        "**Removing 1 node from N=3** invalidates ~67% of keys — every key that was on the removed node plus those that shift.",
        "**Consistent hashing** limits remapping: when a node is added or removed, only `1/N` of keys need to move — the minimum theoretically possible.",
      ],
    },
    {
      heading: "How the Hash Ring Works",
      body: `Consistent hashing maps both nodes and keys onto a circular ring of values (0 to 2³² − 1 or similar). Each key is assigned to the first node encountered when moving **clockwise** from the key's position on the ring.`,
      code: `import hashlib
import bisect

class ConsistentHashRing:
    def __init__(self, virtual_nodes: int = 150):
        self.virtual_nodes = virtual_nodes
        self._ring: dict[int, str] = {}       # hash position → node name
        self._sorted_keys: list[int] = []

    def _hash(self, key: str) -> int:
        return int(hashlib.md5(key.encode()).hexdigest(), 16)

    def add_node(self, node: str):
        # Each physical node gets virtual_nodes positions on the ring
        # This distributes load more evenly (real nodes rarely hash uniformly)
        for i in range(self.virtual_nodes):
            virtual_key = f"{node}:vnode{i}"
            h = self._hash(virtual_key)
            self._ring[h] = node
        self._sorted_keys = sorted(self._ring.keys())
        print(f"Added {node} with {self.virtual_nodes} virtual nodes")

    def remove_node(self, node: str):
        for i in range(self.virtual_nodes):
            h = self._hash(f"{node}:vnode{i}")
            del self._ring[h]
        self._sorted_keys = sorted(self._ring.keys())

    def get_node(self, key: str) -> str:
        if not self._ring:
            raise ValueError("Empty ring")
        h = self._hash(key)
        # Find the first ring position >= h (clockwise)
        idx = bisect.bisect(self._sorted_keys, h)
        if idx == len(self._sorted_keys):
            idx = 0   # wrap around
        return self._ring[self._sorted_keys[idx]]

ring = ConsistentHashRing(virtual_nodes=150)
ring.add_node("cache-1")
ring.add_node("cache-2")
ring.add_node("cache-3")

keys = [f"user:{i}" for i in range(10)]
for k in keys:
    print(f"{k:12} → {ring.get_node(k)}")`,
    },
    {
      heading: "Virtual Nodes",
      body: `Without virtual nodes, physical nodes often cluster unevenly on the ring — one node might own 60% of the key space while another owns only 5%. **Virtual nodes** solve this: each physical node is represented by hundreds of positions on the ring, spreading ownership evenly.`,
      items: [
        "**150 virtual nodes per physical node** is a common default (used by Cassandra). Higher numbers give more even distribution but more memory overhead in the ring structure.",
        "**Even distribution**: with enough virtual nodes, each node owns approximately `1/N` of the key space regardless of its random hash positions.",
        "**Heterogeneous capacity**: a more powerful node can be given more virtual nodes, giving it a proportionally larger share of the key space.",
        "**Adding a node**: the new node takes over ~`1/N` of keys from all existing nodes — a small, even impact. No mass rehash.",
        "**Where it's used**: Cassandra (token ring), Amazon DynoDB, Redis Cluster (uses fixed 16384 hash slots — a variant), Memcached client-side consistent hashing (ketama algorithm).",
      ],
    },
    {
      heading: "Replication on the Ring",
      body: `For fault tolerance, each key is replicated to multiple consecutive nodes on the ring. Cassandra's replication strategy walks the ring clockwise and assigns the key to the next N distinct physical nodes.`,
      code: `def get_nodes(self, key: str, replicas: int = 3) -> list[str]:
    """Return the list of nodes responsible for this key (for replication)."""
    if not self._ring:
        raise ValueError("Empty ring")
    h = self._hash(key)
    idx = bisect.bisect(self._sorted_keys, h)

    seen_nodes = set()
    result = []

    for i in range(len(self._sorted_keys)):
        pos = self._sorted_keys[(idx + i) % len(self._sorted_keys)]
        node = self._ring[pos]
        if node not in seen_nodes:
            seen_nodes.add(node)
            result.append(node)
        if len(result) == replicas:
            break

    return result

# Usage:
ring.add_node("node-1"); ring.add_node("node-2")
ring.add_node("node-3"); ring.add_node("node-4")

print(ring.get_nodes("user:42", replicas=3))
# ['node-2', 'node-4', 'node-1'] — 3 consecutive distinct nodes on the ring

# With RF=3: writing to QUORUM (2 of 3) guarantees at least 1 overlap
# between any write quorum and any read quorum → strong consistency`,
    },
  ],
};
