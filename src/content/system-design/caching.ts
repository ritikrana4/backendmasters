import type { DiagramConfig } from "@/components/FlowDiagram";

const cacheDiagram: DiagramConfig = {
  width: 720,
  height: 230,
  caption: "Cache-aside: app checks Redis first; on a miss it queries the DB and populates the cache",
  nodes: [
    { id: "user",  type: "client",   label: "User",        x: 75,  y: 115 },
    { id: "app",   type: "server",   label: "App Server",  x: 270, y: 115 },
    { id: "cache", type: "cache",    label: "Redis",       sublabel: "cache", x: 490, y: 60  },
    { id: "db",    type: "database", label: "Database",    x: 490, y: 175 },
  ],
  edges: [
    { from: "user",  to: "app",   label: "request" },
    { from: "app",   to: "cache", label: "1. check" },
    { from: "cache", to: "app",   label: "2a. hit" },
    { from: "app",   to: "db",    label: "2b. miss", dashed: true },
    { from: "db",    to: "cache", label: "3. populate", dashed: true },
  ],
};

export const content = {
  title: "Caching Strategies",
  sections: [
    {
      heading: "Cache-Aside (Lazy Loading)",
      diagram: cacheDiagram,
      body: `**Cache-aside** is the most common caching pattern. The application manages the cache explicitly: check the cache first; on a miss, fetch from the database and write the result to cache.

The cache is only populated with data that has actually been requested — it's lazy. Cold caches (after a restart or cache eviction) cause a burst of DB queries until the cache warms up.`,
      code: `import redis, json
from functools import wraps

r = redis.Redis(host="redis", decode_responses=True)

def cache_aside(key_fn, ttl=300):
    """Decorator: cache-aside pattern with configurable TTL."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            key = key_fn(*args, **kwargs)
            cached = r.get(key)
            if cached:
                return json.loads(cached)           # cache hit
            result = fn(*args, **kwargs)            # cache miss → query DB
            r.setex(key, ttl, json.dumps(result))  # populate cache
            return result
        return wrapper
    return decorator

@cache_aside(key_fn=lambda user_id: f"user:{user_id}", ttl=600)
def get_user(user_id: int) -> dict:
    return db.query("SELECT * FROM users WHERE id = %s", [user_id])

# Cache invalidation on write
def update_user(user_id: int, data: dict):
    db.execute("UPDATE users SET ... WHERE id = %s", [user_id, *data.values()])
    r.delete(f"user:{user_id}")   # invalidate — next read rebuilds from DB`,
    },
    {
      heading: "Write-Through & Write-Behind",
      body: `**Write-through** writes to both the cache and database on every write, synchronously. The cache is always consistent with the DB. **Write-behind** (write-back) writes to cache first and asynchronously flushes to the DB — lower write latency but risk of data loss if the cache crashes before the flush.`,
      code: `# Write-through: write to DB AND cache together
def create_product(product: dict) -> dict:
    saved = db.insert("products", product)          # 1. write to DB
    r.setex(f"product:{saved['id']}", 3600,         # 2. write to cache
            json.dumps(saved))
    return saved

# Both DB and cache are updated atomically (within the same request).
# Next read will always be a cache hit. More writes → more cache load.

# Write-behind: write to cache, async flush to DB
# Use a background worker to drain the write queue
import asyncio
from collections import defaultdict

write_buffer = {}

def write_behind_update(key: str, data: dict):
    write_buffer[key] = data                # write to buffer (fast)
    r.setex(key, 300, json.dumps(data))     # update cache immediately

async def flush_worker():
    """Runs in background — drains write buffer to DB every 500ms."""
    while True:
        await asyncio.sleep(0.5)
        if write_buffer:
            batch = write_buffer.copy()
            write_buffer.clear()
            for key, data in batch.items():
                db.upsert(data)             # bulk write to DB

# Risk: if the cache crashes with a full buffer, unflushed writes are lost.
# Mitigate: use Redis persistence (AOF) or a durable queue (Kafka) as the buffer.`,
    },
    {
      heading: "Cache Eviction Policies",
      body: `When the cache is full, the eviction policy decides which entry to remove. The right policy depends on your access patterns.`,
      items: [
        "**LRU (Least Recently Used)**: evicts the entry that hasn't been accessed the longest. Best for most web workloads — recently accessed data is likely to be accessed again.",
        "**LFU (Least Frequently Used)**: evicts the entry accessed the fewest times. Better than LRU for workloads with long-tail access patterns where some keys are always hot.",
        "**TTL-based expiry**: every entry has an expiry time. Guarantees eventual consistency — data can't be stale longer than the TTL. Use with LRU for a combined strategy.",
        "**No eviction (Redis `maxmemory-policy noeviction`)**: returns an error when full. Use for session storage where you never want silent data loss.",
        "**Redis default is `noeviction`**: change to `allkeys-lru` for a general cache, `volatile-lru` (only evict entries with a TTL set) for a cache that also stores non-expirable data.",
      ],
    },
    {
      heading: "The Thundering Herd Problem",
      body: `When a popular cache entry expires, hundreds of requests simultaneously notice the miss and all hit the database at once. This **thundering herd** can crash the database under load.`,
      code: `# Problem: 1000 concurrent requests all miss on the same expired key
def get_trending_posts():
    cached = r.get("trending")
    if not cached:
        # All 1000 threads reach here simultaneously
        posts = db.query("SELECT ... ORDER BY views DESC LIMIT 20")  # DB overloaded
        r.setex("trending", 300, json.dumps(posts))
    return json.loads(cached or json.dumps(posts))

# Solution 1: Mutex lock — only one request rebuilds the cache
import threading
_lock = threading.Lock()

def get_trending_posts_safe():
    cached = r.get("trending")
    if cached: return json.loads(cached)

    with _lock:
        # Re-check after acquiring lock — another thread may have populated it
        cached = r.get("trending")
        if cached: return json.loads(cached)
        posts = db.query("SELECT ... ORDER BY views DESC LIMIT 20")
        r.setex("trending", 300, json.dumps(posts))
        return posts

# Solution 2: Probabilistic early expiry (XFetch algorithm)
# Re-fetch the value slightly before it expires, while still serving the cached value
import math, time

def should_recompute(key: str, beta: float = 1.0) -> bool:
    ttl = r.ttl(key)
    delta = 0.1   # estimated recompute time in seconds
    return ttl - delta * beta * math.log(random.random()) < 0`,
    },
  ],
};
