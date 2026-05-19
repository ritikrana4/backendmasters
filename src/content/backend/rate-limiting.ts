export const content = {
  title: "Rate Limiting & Throttling",
  sections: [
    {
      heading: "Why Rate Limit?",
      body: `**Rate limiting** controls how many requests a client can make in a time window. Without it, a single bad actor (or a buggy client) can overwhelm your API, degrade service for everyone, run up your infrastructure costs, or brute-force passwords. Rate limiting is a fundamental API protection mechanism.`,
      items: [
        "**DDoS protection** — prevent a single source from flooding your service",
        "**Brute force prevention** — limit login/OTP attempts to prevent credential stuffing",
        "**Cost control** — prevent runaway scripts from generating huge cloud bills",
        "**Fair use** — prevent one tenant from consuming all capacity in a multi-tenant system",
        "**Downstream protection** — limit calls to external APIs that charge per request",
      ],
    },
    {
      heading: "Rate Limiting Algorithms",
      body: `Four algorithms with different trade-offs. Token Bucket and Sliding Window Log are the most practical for APIs.`,
      code: `# Algorithm 1: Fixed Window Counter
# Simple: count requests in the current window, reset at boundary
# Weakness: burst at window boundary (100 at 11:59, 100 at 12:00 = 200 in 2 seconds)

# Algorithm 2: Sliding Window Log
# Store timestamp of every request in a sorted set
# Count requests in the last N seconds
# Most accurate, but memory-intensive for high-traffic APIs

import redis, time

r = redis.Redis()

def is_allowed_sliding_window(user_id: str, limit: int, window: int) -> bool:
    key = f"ratelimit:{user_id}"
    now = time.time()
    cutoff = now - window

    pipe = r.pipeline()
    pipe.zremrangebyscore(key, 0, cutoff)    # remove old entries
    pipe.zadd(key, {str(now): now})           # add current request
    pipe.zcard(key)                           # count requests in window
    pipe.expire(key, window)
    results = pipe.execute()

    count = results[2]
    return count <= limit

# Algorithm 3: Token Bucket (most common for APIs)
# Bucket holds N tokens, refills at R tokens/second
# Each request consumes 1 token
# Allows bursting up to bucket size, then enforces average rate

# Algorithm 4: Leaky Bucket
# Requests processed at a fixed rate (drip), excess queued or dropped
# Smooths traffic, no bursting allowed`,
    },
    {
      heading: "Token Bucket with Redis",
      body: `**Token bucket** is the most common algorithm for API rate limiting. It allows short bursts (up to bucket capacity) while enforcing an average rate.`,
      code: `# Token bucket implementation with Redis (Lua script for atomicity)
TOKEN_BUCKET_SCRIPT = """
local key        = KEYS[1]
local capacity   = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])   -- tokens per second
local now        = tonumber(ARGV[3])

local bucket = redis.call("HMGET", key, "tokens", "last_refill")
local tokens     = tonumber(bucket[1]) or capacity
local last_refill = tonumber(bucket[2]) or now

-- Refill tokens based on elapsed time
local elapsed = now - last_refill
local refill  = elapsed * refill_rate
tokens = math.min(capacity, tokens + refill)

if tokens >= 1 then
    tokens = tokens - 1
    redis.call("HMSET", key, "tokens", tokens, "last_refill", now)
    redis.call("EXPIRE", key, 3600)
    return 1   -- allowed
else
    return 0   -- denied
end
"""

def check_rate_limit(identifier: str, capacity: int, rate: float) -> bool:
    now = time.time()
    key = f"token_bucket:{identifier}"
    result = r.eval(TOKEN_BUCKET_SCRIPT, 1, key, capacity, rate, now)
    return result == 1

# Usage: 100 requests/minute per user (burst up to 100)
@router.get("/search")
async def search(q: str, user: User = Depends(get_current_user)):
    if not check_rate_limit(f"user:{user.id}", capacity=100, rate=100/60):
        raise HTTPException(
            status_code=429,
            headers={"Retry-After": "60"},
            detail="Rate limit exceeded"
        )
    return do_search(q)`,
    },
    {
      heading: "Rate Limit Headers",
      body: `Well-designed APIs communicate rate limit status to clients so they can back off gracefully rather than hammering until they hit 429.`,
      code: `# Standard rate limit response headers
HTTP/1.1 200 OK
X-RateLimit-Limit: 100        # total allowed per window
X-RateLimit-Remaining: 47     # remaining in current window
X-RateLimit-Reset: 1716090060 # Unix timestamp when window resets

# When limit is exceeded:
HTTP/1.1 429 Too Many Requests
Retry-After: 30               # seconds until they can try again
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1716090060

# FastAPI middleware example
from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        user_id = get_user_id_from_request(request)
        limit, remaining, reset = get_rate_limit_info(user_id)

        if remaining <= 0:
            return Response(
                status_code=429,
                headers={"Retry-After": str(reset - int(time.time()))}
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"]     = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining - 1)
        response.headers["X-RateLimit-Reset"]     = str(reset)
        return response`,
    },
    {
      heading: "Rate Limit Strategies",
      body: `Different dimensions and strategies for applying rate limits in production.`,
      items: [
        "**Per-user** — limit each authenticated user independently. Most fair for multi-tenant APIs.",
        "**Per-IP** — limit by IP address for unauthenticated requests (login, signup). Careful with NAT — many users share one IP.",
        "**Per-API-key** — each API key has its own limit. Different tiers get different limits (free: 100/min, paid: 10,000/min).",
        "**Global** — a total limit across all users to protect infrastructure capacity.",
        "**Endpoint-specific** — tighter limits on expensive endpoints (search, export, AI generation) than simple CRUD.",
        "**Tiered limits**: short-window burst (10/sec) + long-window sustained (1000/hour). Prevents micro-bursts while allowing sustained use.",
      ],
    },
  ],
};
