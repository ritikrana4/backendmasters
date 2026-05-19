export const content = {
  title: "Caching",
  sections: [
    {
      heading: "Why Cache?",
      body: `**Caching** stores the result of an expensive operation so future requests can get it faster. Without caching, every request to a popular endpoint hits the database, serializes data, and computes results — even when the answer hasn't changed. Caching can reduce latency from 100ms to 1ms and cut database load by 90%+.`,
      items: [
        "**L1 cache** — in-process memory (Python dict, LRU cache). Fastest, but per-process, lost on restart",
        "**L2 cache** — external cache (Redis, Memcached). Shared across all processes/instances, survives restarts",
        "**CDN cache** — edge nodes cache HTTP responses near users. Sub-millisecond globally for static content",
        "**Database query cache** — most ORMs and query builders have built-in result caching",
        "The golden rule: cache data that is read often, changes rarely, and is expensive to compute",
      ],
    },
    {
      heading: "Cache-Aside (Lazy Loading)",
      body: `**Cache-aside** (also called lazy loading) is the most common pattern. The application code manages the cache explicitly: check cache first, fall back to the database, then populate the cache.`,
      code: `# Cache-aside pattern in Python with Redis
import redis
import json

r = redis.Redis()

def get_user(user_id: int) -> dict:
    cache_key = f"user:{user_id}"

    # 1. Check cache
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)   # cache hit

    # 2. Cache miss — query database
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        return None

    # 3. Populate cache with TTL
    r.setex(cache_key, 300, json.dumps(user.to_dict()))  # 5 min TTL

    return user.to_dict()

# Invalidate on write
def update_user(user_id: int, data: dict) -> None:
    db.query(User).filter_by(id=user_id).update(data)
    db.commit()
    r.delete(f"user:{user_id}")  # invalidate cache`,
    },
    {
      heading: "Write-Through & Write-Behind",
      body: `Two alternative caching strategies that keep the cache always warm by writing to it on every update.`,
      code: `# Write-through: write to BOTH cache and DB synchronously
def update_user_write_through(user_id: int, data: dict) -> None:
    # Write to DB
    db.query(User).filter_by(id=user_id).update(data)
    db.commit()
    # Write to cache immediately (always warm)
    r.setex(f"user:{user_id}", 300, json.dumps(data))
# ✅ No cache miss after update
# ❌ Extra write on every update (even infrequently-read data)

# Write-behind (write-back): write to cache, async flush to DB
# Write to cache immediately, return success
# Background worker flushes dirty cache entries to DB

# ✅ Very fast writes (only hit Redis)
# ❌ Data loss risk: if Redis crashes before flush, updates are lost
# Use case: high-write counters, analytics (views, clicks)
def increment_view_count(post_id: int) -> None:
    # Increment in Redis — batch-flush to DB every minute
    r.incr(f"post:{post_id}:views")`,
    },
    {
      heading: "Cache Invalidation",
      body: `"There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton. Stale caches are a major source of production bugs.`,
      items: [
        "**TTL (Time To Live)** — simplest: cache expires after N seconds. Stale data is bounded by TTL. Good for data that's OK to be slightly stale.",
        "**Event-based invalidation** — invalidate cache on write events. More accurate, more code. Use when stale data is unacceptable (balances, inventory).",
        "**Cache stampede** — TTL expires, many requests all miss the cache and hit the DB simultaneously. Fix with probabilistic early expiry, mutex lock, or background refresh.",
        "**Cache key design**: be specific. `user:42` not `users`. Include version if schema changes: `user:v2:42`.",
        "**Avoid caching too aggressively** — money, inventory, and security-sensitive data should not have long TTLs.",
        "**Write invalidation pattern**: delete the cache key on write, not update it — simpler and avoids race conditions.",
      ],
      code: `# Cache stampede prevention with mutex lock
import time

def get_popular_feed(user_id: int) -> list:
    cache_key = f"feed:{user_id}"
    lock_key  = f"feed:{user_id}:lock"

    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)

    # Try to acquire lock (only one process rebuilds the cache)
    if r.set(lock_key, "1", nx=True, ex=10):  # NX = only if not exists
        try:
            result = expensive_feed_query(user_id)
            r.setex(cache_key, 300, json.dumps(result))
            return result
        finally:
            r.delete(lock_key)
    else:
        # Another process is rebuilding — wait and retry
        time.sleep(0.1)
        return get_popular_feed(user_id)`,
    },
    {
      heading: "What to Cache & What Not to Cache",
      body: `Caching everything is not the goal — caching the right things makes systems fast without introducing subtle bugs.`,
      items: [
        "**Cache**: expensive DB queries, computed aggregations, user profile data, product catalog, rendered HTML fragments, API responses to external services",
        "**Don't cache**: passwords, fresh financial data (balances, transactions), user-specific security state, data that must be real-time accurate",
        "**Cache headers for HTTP**: set `Cache-Control: max-age=3600` for public API responses that are safe to cache at the CDN or browser",
        "**Redis data types for caching**: strings for single values, hashes for objects, sorted sets for leaderboards and expiry queues",
        "**Monitor your cache**: track hit rate (aim for > 80%), memory usage, and eviction rate. A low hit rate means your cache keys are wrong or TTLs are too short.",
      ],
    },
  ],
};
