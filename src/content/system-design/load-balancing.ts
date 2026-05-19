import type { DiagramConfig } from "@/components/FlowDiagram";

const lbDiagram: DiagramConfig = {
  width: 760,
  height: 230,
  caption: "L7 load balancer: routes requests from multiple clients across backend servers with active health checks",
  nodes: [
    { id: "u1",  type: "client",       label: "User A",     x: 75,  y: 75  },
    { id: "u2",  type: "client",       label: "User B",     x: 75,  y: 155 },
    { id: "lb",  type: "loadbalancer", label: "Load Balancer", x: 280, y: 115 },
    { id: "s1",  type: "server",       label: "App Server 1", x: 510, y: 55  },
    { id: "s2",  type: "server",       label: "App Server 2", x: 510, y: 115 },
    { id: "s3",  type: "server",       label: "App Server 3", x: 510, y: 175 },
    { id: "hc",  type: "proxy",        label: "Health Check", sublabel: "/health probe", x: 680, y: 55 },
  ],
  edges: [
    { from: "u1", to: "lb" },
    { from: "u2", to: "lb" },
    { from: "lb", to: "s1" },
    { from: "lb", to: "s2" },
    { from: "lb", to: "s3" },
    { from: "lb", to: "hc", dashed: true, label: "probe" },
  ],
};

export const content = {
  title: "Load Balancing at Scale",
  sections: [
    {
      heading: "L4 vs L7 Load Balancing",
      diagram: lbDiagram,
      body: `**Layer 4 (transport layer)** load balancers route based on IP address and TCP/UDP port. They don't read the HTTP payload — they just forward TCP connections. Very fast and efficient but routing decisions are limited to source/dest IP and port.

**Layer 7 (application layer)** load balancers read the HTTP request — URL path, headers, cookies — and make intelligent routing decisions. Slower than L4 but enables path-based routing, header manipulation, SSL termination, and content-aware health checks.`,
      items: [
        "**L4 use cases**: raw TCP proxying, game servers, database proxies (PgBouncer), ultra-low latency requirements",
        "**L7 use cases**: HTTP APIs, microservices routing, A/B testing, canary deployments, WAF integration",
        "**AWS examples**: Network Load Balancer (L4, millions of req/s), Application Load Balancer (L7, path/header routing)",
        "**Nginx and HAProxy** support both: Nginx `stream {}` block = L4, `http {}` block = L7",
      ],
    },
    {
      heading: "Routing Algorithms",
      body: `The algorithm determines which backend receives each request. The wrong algorithm for your workload causes hotspots and uneven load distribution.`,
      code: `# Round-robin — equal distribution in order. Best for uniform request sizes.
upstream rr { server s1:8000; server s2:8000; server s3:8000; }

# Weighted round-robin — proportional to server capacity
upstream weighted {
    server s1:8000 weight=5;  # 50% of traffic (faster machine)
    server s2:8000 weight=3;  # 30%
    server s3:8000 weight=2;  # 20%
}

# Least connections — route to server with fewest active requests
# Best when request processing time varies (some requests are fast, some slow)
upstream lc { least_conn; server s1:8000; server s2:8000; server s3:8000; }

# IP hash — same client IP always goes to same server (sticky)
# Use ONLY when you can't externalise session state (legacy apps)
# Breaks if a server goes down (client re-hashes to different server)
upstream sticky { ip_hash; server s1:8000; server s2:8000; }

# Random with two choices (power of two choices)
# Pick 2 random servers, send to the one with fewer connections
# Statistically approaches least-connections without coordination overhead
upstream p2c { random two; server s1:8000; server s2:8000; server s3:8000; }`,
    },
    {
      heading: "Health Checks & Failover",
      body: `A load balancer without health checks sends traffic to dead servers. **Passive health checks** mark a server down after failed real requests. **Active health checks** probe the server on a schedule regardless of traffic — faster detection.`,
      code: `# Nginx passive health check (open-source, built-in)
upstream app {
    server s1:8000 max_fails=3 fail_timeout=30s;
    server s2:8000 max_fails=3 fail_timeout=30s;
    server s3:8000 backup;  # only used if s1 and s2 both fail
}
# After 3 consecutive failures within 30s → marked down for 30s
# Tried again automatically after fail_timeout

# HAProxy active health check (probes independently of traffic)
backend app
    balance roundrobin
    option  httpchk GET /health HTTP/1.1\r\nHost:\ localhost
    http-check expect status 200
    server s1 10.0.1.1:8000 check inter 5s fall 3 rise 2
    server s2 10.0.1.2:8000 check inter 5s fall 3 rise 2
    # fall 3 = down after 3 failed probes
    # rise 2 = back up after 2 consecutive successful probes

# Good health check endpoint (FastAPI)
@app.get("/health")
async def health():
    try:
        await db.execute("SELECT 1")  # check DB connection
        return {"status": "ok"}
    except Exception:
        raise HTTPException(503, "database unreachable")`,
    },
    {
      heading: "Session Persistence & Sticky Sessions",
      body: `Some applications store per-user state on the application server (session files, in-memory caches). With a load balancer, subsequent requests may hit different servers and lose the session. **Sticky sessions** force requests from the same client to always route to the same server.`,
      items: [
        "**Cookie-based sticky sessions**: LB sets a cookie on first response; subsequent requests with that cookie always route to the same backend. Common in Nginx Plus and AWS ALB.",
        "**The right fix is statelessness**: sticky sessions are a band-aid. Store sessions in Redis and let any server handle any request.",
        "**Sticky sessions break failover**: if the pinned server dies, the client is re-routed to a new server and loses their session anyway.",
        "**Acceptable use**: legacy apps you can't modify, WebSocket connections (must stay on the same server for the duration of the connection), or stateful streaming.",
        "**WebSocket sticky sessions**: a WebSocket connection must stay on one server for its lifetime. Use IP hash or cookie-based stickiness, and accept that you lose the connection if that server restarts.",
      ],
    },
  ],
};
