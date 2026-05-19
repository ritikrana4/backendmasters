import type { DiagramConfig } from "@/components/FlowDiagram";

const rlDiagram: DiagramConfig = {
  width: 760,
  height: 190,
  caption: "Rate limiting at the API gateway: every request checks a Redis counter before reaching the service",
  nodes: [
    { id: "client",  type: "client",       label: "Client",       x: 75,  y: 95  },
    { id: "gw",      type: "loadbalancer", label: "API Gateway",  x: 270, y: 95  },
    { id: "redis",   type: "cache",        label: "Redis",        sublabel: "counters", x: 270, y: 175 },
    { id: "svc",     type: "server",       label: "Service",      x: 490, y: 95  },
    { id: "db",      type: "database",     label: "Database",     x: 670, y: 95  },
  ],
  edges: [
    { from: "client", to: "gw",    label: "request" },
    { from: "gw",     to: "redis", label: "check limit", dashed: true },
    { from: "gw",     to: "svc",   label: "allowed" },
    { from: "svc",    to: "db" },
  ],
};

export const content = {
  title: "Distributed Rate Limiting",
  sections: [
    {
      heading: "Why Rate Limiting?",
      diagram: rlDiagram,
      body: `**Rate limiting** caps how many requests a client can make in a time window. Without it, a single misbehaving client (buggy script, malicious bot, or even a popular customer) can exhaust your server resources and cause a denial-of-service for everyone else.

At scale, rate limiting must be **distributed**: if you have 10 API gateway nodes and each enforces its own in-memory counter, a client can send 10× the allowed rate by round-robining across nodes. The solution is a **shared counter** in Redis.`,
      items: [
        "**Protect the backend**: prevent one client from saturating database connections, CPU, or downstream APIs.",
        "**Fair usage**: ensure all clients get a fair share of capacity.",
        "**Cost control**: for external API calls (LLM APIs, payment processors), rate limiting prevents unexpected bills from runaway scripts.",
        "**DDoS mitigation**: rate limiting is the first layer of defence against application-layer DDoS.",
      ],
    },
    {
      heading: "Token Bucket Algorithm",
      body: `The **token bucket** is the most common algorithm. A bucket holds up to \`capacity\` tokens. Tokens are added at a steady \`refill_rate\`. Each request consumes one token. If the bucket is empty, the request is rejected (or queued).

It naturally handles bursts: if a client hasn't sent requests for a while, tokens accumulate up to the capacity, allowing a burst before being throttled.`,
      code: `import time, redis

r = redis.Redis(decode_responses=True)

def token_bucket_check(
    client_id: str,
    capacity: int = 100,       # max burst size
    refill_rate: float = 10.0, # tokens per second
) -> bool:
    """Returns True if the request is allowed."""
    key = f"tb:{client_id}"
    now = time.time()

    pipe = r.pipeline()
    pipe.hgetall(key)
    results = pipe.execute()
    data = results[0]

    tokens     = float(data.get("tokens", capacity))
    last_refill = float(data.get("last_refill", now))

    # Add tokens earned since last request
    elapsed = now - last_refill
    tokens = min(capacity, tokens + elapsed * refill_rate)

    if tokens < 1:
        return False  # bucket empty — reject

    # Consume one token
    pipe = r.pipeline()
    pipe.hset(key, mapping={"tokens": tokens - 1, "last_refill": now})
    pipe.expire(key, int(capacity / refill_rate) + 10)
    pipe.execute()
    return True

# Usage in FastAPI
from fastapi import Request, HTTPException

@app.middleware("http")
async def rate_limit(request: Request, call_next):
    api_key = request.headers.get("X-API-Key", request.client.host)
    if not token_bucket_check(api_key):
        raise HTTPException(429, detail="Rate limit exceeded",
                            headers={"Retry-After": "6"})
    return await call_next(request)`,
    },
    {
      heading: "Sliding Window Log",
      body: `The **sliding window log** stores a timestamp for each request in a sorted set. On each request, remove all timestamps older than the window, count remaining entries, and allow if below the limit.

More accurate than fixed window (no boundary spikes) and more precise than token bucket, but uses more memory (stores one entry per request).`,
      code: `import time, redis

r = redis.Redis(decode_responses=True)

def sliding_window_check(
    client_id: str,
    limit: int = 100,
    window: int = 60,   # seconds
) -> tuple[bool, int]:
    """Returns (allowed, requests_remaining)."""
    key = f"sw:{client_id}"
    now = time.time()
    window_start = now - window

    pipe = r.pipeline()
    pipe.zremrangebyscore(key, 0, window_start)   # remove old entries
    pipe.zcard(key)                                # count in current window
    pipe.zadd(key, {str(now): now})                # log this request
    pipe.expire(key, window + 1)
    _, count, *_ = pipe.execute()

    allowed = count < limit
    if not allowed:
        # Undo the add — request rejected
        r.zrem(key, str(now))
    return allowed, max(0, limit - count - (1 if allowed else 0))

# HTTP headers for good client experience
allowed, remaining = sliding_window_check("user:42")
headers = {
    "X-RateLimit-Limit":     "100",
    "X-RateLimit-Remaining": str(remaining),
    "X-RateLimit-Reset":     str(int(time.time()) + 60),
}
if not allowed:
    return 429, headers, {"error": "rate limit exceeded"}`,
    },
    {
      heading: "Rate Limiting Strategies",
      body: `Different limiting strategies serve different purposes. Most production systems combine multiple levels.`,
      items: [
        "**Per-IP**: protects against unauthenticated abuse and bots. Apply to login and signup endpoints. Easy to bypass with IP rotation.",
        "**Per-API-key / per-user**: the standard for authenticated APIs. Gives each customer a fair share. Common: 100 req/min for free tier, 1000 req/min for paid.",
        "**Per-endpoint**: rate limit expensive endpoints (search, export, report generation) more aggressively than cheap ones (GET /users/me).",
        "**Global rate limit**: caps total requests per second across all users to protect the backend from spikes. Shed load gracefully with a 503 rather than crashing.",
        "**Retry-After header**: always include this in 429 responses — tells clients exactly when to retry. Prevents clients from immediately hammering after being limited.",
        "**Graceful degradation**: for bursts, queue requests rather than rejecting them. Use Nginx `limit_req burst=20 nodelay` to absorb small bursts without immediate 429s.",
      ],
    },
  ],
};
