export const content = {
  title: "Load Balancers & Reverse Proxies",
  sections: [
    {
      heading: "Reverse Proxy vs Load Balancer",
      body: `A **reverse proxy** sits in front of one or more servers and forwards client requests to them. It hides the backend topology from clients. A **load balancer** is a reverse proxy that distributes traffic across multiple backend instances for availability and scalability. In practice, tools like Nginx and HAProxy do both.

Contrast with a **forward proxy** (like a VPN or corporate proxy), which acts on behalf of clients — a reverse proxy acts on behalf of servers.`,
      items: [
        "**Reverse proxy**: SSL termination, caching, compression, URL rewriting — one backend or many",
        "**Load balancer**: distributes traffic across a pool of backends, removes unhealthy instances, scales horizontally",
        "**Layer 4 (TCP/UDP)**: routes based on IP/port — fast, protocol-agnostic, no HTTP awareness",
        "**Layer 7 (HTTP)**: routes based on URL, headers, cookies — can make smarter routing decisions but does more work",
        "**Nginx and HAProxy**: both support L4 and L7. Nginx is also a web server and reverse proxy; HAProxy is a dedicated load balancer",
      ],
    },
    {
      heading: "Nginx as a Reverse Proxy",
      body: `Nginx is the most widely used reverse proxy. It handles SSL termination, request routing, header manipulation, and upstream load balancing in a single config file.`,
      code: `# nginx.conf — reverse proxy with upstream pool

# Define the upstream server pool
upstream app_servers {
    least_conn;                        # load balancing algorithm
    server 10.0.1.10:8000 weight=2;   # gets 2x the traffic
    server 10.0.1.11:8000;
    server 10.0.1.12:8000;
    server 10.0.1.13:8000 backup;     # only used if others are down

    keepalive 32;   # keep persistent connections to upstreams
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate     /etc/ssl/certs/api.crt;
    ssl_certificate_key /etc/ssl/private/api.key;

    # Pass all traffic to the upstream pool
    location / {
        proxy_pass         http://app_servers;
        proxy_http_version 1.1;
        proxy_set_header   Connection "";           # enable keepalive
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        proxy_connect_timeout  5s;
        proxy_read_timeout    30s;
    }
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    return 301 https://$host$request_uri;
}`,
    },
    {
      heading: "Load Balancing Algorithms",
      body: `The algorithm determines which upstream receives each request. The right choice depends on your backend characteristics.`,
      code: `# Nginx upstream directives

# Round-robin (default) — requests distributed in order
upstream rr_pool {
    server 10.0.1.10:8000;
    server 10.0.1.11:8000;
    server 10.0.1.12:8000;
}

# Least connections — sends to the server with fewest active connections
# Best when requests have variable processing time
upstream lc_pool {
    least_conn;
    server 10.0.1.10:8000;
    server 10.0.1.11:8000;
}

# IP hash — same client IP always goes to the same server (sticky sessions)
# Useful when server-side session state isn't centralised (not ideal — use Redis instead)
upstream sticky_pool {
    ip_hash;
    server 10.0.1.10:8000;
    server 10.0.1.11:8000;
}

# Weighted round-robin — server gets proportional share of traffic
# Use when instances have different capacities
upstream weighted_pool {
    server 10.0.1.10:8000 weight=5;   # 5/8 of traffic
    server 10.0.1.11:8000 weight=2;   # 2/8 of traffic
    server 10.0.1.12:8000 weight=1;   # 1/8 of traffic
}`,
    },
    {
      heading: "Health Checks & Failover",
      body: `A load balancer must stop sending traffic to unhealthy instances. Nginx open-source uses **passive health checks** (marks a server down after failed requests). Nginx Plus and HAProxy support **active health checks** (periodic probes regardless of traffic).`,
      code: `# Nginx passive health check — built into open-source Nginx
upstream app_servers {
    server 10.0.1.10:8000 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:8000 max_fails=3 fail_timeout=30s;
    # After 3 failures within 30s → marked down for 30s
    # Automatically retried after fail_timeout
}

# HAProxy active health check — probes every 2s
backend app_servers
    balance roundrobin
    option  httpchk GET /health    # probe path
    http-check expect status 200   # expected response
    server app1 10.0.1.10:8000 check inter 2s fall 3 rise 2
    server app2 10.0.1.11:8000 check inter 2s fall 3 rise 2
    # fall 3 → down after 3 failed probes
    # rise 2 → back up after 2 successful probes

# Python: checking if upstream is healthy before routing (simplified)
import httpx

async def is_healthy(upstream: str) -> bool:
    try:
        r = await httpx.AsyncClient().get(f"http://{upstream}/health", timeout=2.0)
        return r.status_code == 200
    except Exception:
        return False`,
    },
    {
      heading: "SSL Termination",
      body: `**SSL termination** at the load balancer means TLS is decrypted once at the edge. Traffic between the load balancer and backends travels over plain HTTP on a private network. This simplifies certificate management — one cert on the load balancer instead of one on every backend.`,
      items: [
        "**Pros**: centralised cert management, backends don't need TLS config, faster backend-to-backend communication on internal networks",
        "**Cons**: traffic between load balancer and backends is unencrypted — only acceptable on a trusted private network",
        "**SSL passthrough**: load balancer forwards the raw TLS connection to the backend without decrypting — the backend holds the cert. Use when end-to-end encryption is required (compliance).",
        "**Let's Encrypt + Certbot**: automates free cert issuance and renewal. Works with Nginx and HAProxy.",
        "**HSTS (Strict-Transport-Security)**: tell browsers to always use HTTPS. Add `add_header Strict-Transport-Security \"max-age=31536000\";` in Nginx.",
      ],
    },
  ],
  starterCode: `# Load balancing algorithm simulation

import itertools
import random

class RoundRobin:
    def __init__(self, servers):
        self._iter = itertools.cycle(servers)
    def next(self): return next(self._iter)

class WeightedRoundRobin:
    def __init__(self, servers_weights: list[tuple[str, int]]):
        # Expand pool based on weights: [("A",2),("B",1)] → ["A","A","B"]
        pool = []
        for server, weight in servers_weights:
            pool.extend([server] * weight)
        self._iter = itertools.cycle(pool)
    def next(self): return next(self._iter)

class LeastConnections:
    def __init__(self, servers):
        self._conns = {s: 0 for s in servers}
    def next(self):
        return min(self._conns, key=self._conns.get)
    def done(self, server):
        self._conns[server] = max(0, self._conns[server] - 1)
    def start(self, server):
        self._conns[server] += 1

servers = ["10.0.1.10:8000", "10.0.1.11:8000", "10.0.1.12:8000"]

print("=== Round-robin (6 requests) ===")
rr = RoundRobin(servers)
for i in range(6):
    print(f"  req {i+1} → {rr.next()}")

print("\\n=== Weighted (A=3x, B=1x, C=1x) ===")
wrr = WeightedRoundRobin([("A:8000", 3), ("B:8000", 1), ("C:8000", 1)])
for i in range(10):
    print(f"  req {i+1} → {wrr.next()}")
`,
};
