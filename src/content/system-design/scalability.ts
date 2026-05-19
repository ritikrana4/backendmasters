import type { DiagramConfig } from "@/components/FlowDiagram";

const scalabilityDiagram: DiagramConfig = {
  width: 760,
  height: 230,
  caption: "Horizontal scaling: a load balancer fans requests across stateless servers that share one database",
  nodes: [
    { id: "client", type: "client",       label: "Client",     x: 75,  y: 115 },
    { id: "lb",     type: "loadbalancer", label: "Load Balancer", x: 270, y: 115 },
    { id: "s1",     type: "server",       label: "Server 1",   x: 490, y: 55  },
    { id: "s2",     type: "server",       label: "Server 2",   x: 490, y: 115 },
    { id: "s3",     type: "server",       label: "Server 3",   x: 490, y: 175 },
    { id: "db",     type: "database",     label: "Database",   x: 685, y: 115 },
  ],
  edges: [
    { from: "client", to: "lb" },
    { from: "lb", to: "s1" },
    { from: "lb", to: "s2" },
    { from: "lb", to: "s3" },
    { from: "s1", to: "db" },
    { from: "s2", to: "db" },
    { from: "s3", to: "db" },
  ],
};

export const content = {
  title: "Scalability Fundamentals",
  sections: [
    {
      heading: "Vertical vs Horizontal Scaling",
      diagram: scalabilityDiagram,
      body: `**Vertical scaling** (scaling up) means giving a single machine more CPU, RAM, or disk. It's simple — no code changes — but hits a physical ceiling and creates a single point of failure. **Horizontal scaling** (scaling out) adds more machines. It's cheaper at scale, eliminates single points of failure, and is theoretically unbounded — but requires the application to be stateless.`,
      items: [
        "**Vertical ceiling**: the largest AWS instance is ~24 TB RAM. Beyond that, you must scale horizontally.",
        "**Horizontal requirement**: each server must be able to handle any request — no local session state, no in-memory caches that differ between nodes.",
        "**Cost curve**: vertical scaling is linear; horizontal scaling is sub-linear at scale (commodity hardware + auto-scaling groups).",
        "**When to scale up first**: it's simpler, cheaper to operate, and appropriate until traffic justifies the operational overhead of multiple servers.",
      ],
    },
    {
      heading: "Stateless Services",
      body: `The key enabler of horizontal scaling is **statelessness**: the server holds no per-user state between requests. All state lives in a shared store (database, Redis, S3). Any server can handle any request, so requests can be load balanced freely.`,
      code: `# Stateful (breaks horizontal scaling)
# Session lives in-memory on one server — other servers don't know about it
@app.route("/login", methods=["POST"])
def login():
    user = authenticate(request.form)
    server_memory["session_" + session_id] = user   # only on THIS server
    return set_cookie(session_id)

# If the next request goes to Server 2, it won't find the session.

# Stateless (scales horizontally)
# Session lives in Redis — any server can look it up
import redis

r = redis.Redis(host="redis-cluster")

@app.route("/login", methods=["POST"])
def login():
    user = authenticate(request.form)
    session_id = secrets.token_urlsafe(32)
    r.setex(f"session:{session_id}", 86400, user.id)  # shared store
    return set_cookie(session_id)

# Any server can validate the session by querying Redis.`,
    },
    {
      heading: "Shared-Nothing Architecture",
      body: `**Shared-nothing** means each node is independent — no shared disk, no shared memory. Nodes communicate only via network messages. This is the foundation of systems like Cassandra, Kafka, and most large-scale web backends.`,
      items: [
        "**No shared disk**: each node has its own storage; data is replicated over the network, not via a shared filesystem.",
        "**No shared memory**: nodes don't share RAM or CPU. Communication is only via explicit API calls or message passing.",
        "**Benefits**: linear scalability (add nodes, add capacity), fault isolation (one node crash doesn't corrupt shared state), and no resource contention.",
        "**Trade-off**: you lose ACID transactions across nodes. Distributed consistency requires careful design (eventual consistency, saga pattern, or distributed transactions).",
        "**Practical implication**: upload files to S3 (not local disk), store sessions in Redis (not in-process memory), use a queue for async work (not in-memory queues).",
      ],
    },
    {
      heading: "Auto-Scaling",
      body: `**Auto-scaling** dynamically adjusts the number of running instances based on load metrics. Scale out when CPU exceeds 70%; scale in when it drops below 30%. This handles traffic spikes without over-provisioning.`,
      code: `# AWS Auto Scaling (Terraform example)
resource "aws_autoscaling_group" "app" {
  min_size         = 2      # always at least 2 for HA
  max_size         = 20     # upper limit to control costs
  desired_capacity = 3

  # Scale out when avg CPU > 70% for 2 minutes
  # Scale in  when avg CPU < 30% for 10 minutes
}

resource "aws_autoscaling_policy" "scale_out" {
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = 2      # add 2 instances at a time
  cooldown               = 300    # wait 5 min before scaling again
}

# What makes auto-scaling work:
# 1. Stateless servers (any new instance can serve traffic immediately)
# 2. Health checks (LB removes unhealthy instances automatically)
# 3. Fast startup (Docker containers ready in seconds, not minutes)
# 4. Graceful shutdown (drain in-flight requests before terminating)

# Graceful shutdown in Python (FastAPI)
import signal, asyncio

@app.on_event("shutdown")
async def shutdown():
    # Wait for in-flight requests to finish (up to 30s)
    await asyncio.sleep(0)   # yield to event loop`,
    },
    {
      heading: "Where Bottlenecks Actually Are",
      body: `Most scaling problems are not in the application servers — they're in the database. Application servers are stateless and easy to scale; the database is stateful and harder.`,
      items: [
        "**First bottleneck**: the database — single write primary, limited connections, slow disk I/O. Fix: add read replicas, connection pooling (PgBouncer), query optimisation.",
        "**Second bottleneck**: I/O-bound operations — external API calls, slow database queries blocking threads. Fix: async I/O, task queues, caching.",
        "**Third bottleneck**: network bandwidth — large response payloads, uncompressed assets. Fix: CDN, compression (gzip/brotli), pagination.",
        "**Profiling first**: never scale blindly. Use APM tools (Datadog, New Relic) to find the actual bottleneck before adding infrastructure.",
      ],
    },
  ],
};
