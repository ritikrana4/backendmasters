export const content = {
  title: "System Design Interview Framework",
  sections: [
    {
      heading: "The RESHADED Framework",
      body: `System design interviews reward a structured approach. **RESHADED** is a repeatable framework covering every dimension interviewers assess. Work through it step by step — don't jump to solutions before understanding the problem.

**R**equirements → **E**stimations → **S**torage → **H**igh-level design → **A**PI → **D**ata model → **E**valuate & **D**eep dives`,
      items: [
        "**Requirements (5 min)**: ask clarifying questions. Functional: what does the system do? Non-functional: scale, latency, availability, consistency. Scope: what's in and out?",
        "**Estimations (3 min)**: rough numbers — DAU, requests/sec, data size, storage. These numbers drive every architectural decision.",
        "**Storage**: which databases? SQL vs NoSQL. Blob storage for files. Caching layer. Justify each choice with your requirements.",
        "**High-level design (10 min)**: draw the main components: client, CDN, load balancer, app servers, databases, caches, queues. Show data flow.",
        "**API**: define the key endpoints. Method, path, request/response shapes. Versioning.",
        "**Data model**: schema for the main entities. Which fields get indexed? Normalised vs denormalised?",
        "**Evaluate**: address trade-offs. Where are the bottlenecks? What fails first?",
        "**Deep dives**: let the interviewer drive — they'll pick one area to go deeper (e.g. 'how do you handle hot keys in your cache?')",
      ],
    },
    {
      heading: "Capacity Estimation",
      body: `Rough capacity estimates anchor your architectural choices. You need to know the order of magnitude — don't worry about being precise to 10%.`,
      code: `# Example: Design Twitter

# Step 1: Traffic estimates
DAU = 100_000_000        # 100M daily active users
TWEETS_PER_USER_DAY = 2
READS_PER_USER_DAY  = 200

WRITE_RPS = (DAU * TWEETS_PER_USER_DAY) / 86400   # ~2,300 req/s
READ_RPS  = (DAU * READS_PER_USER_DAY)  / 86400   # ~230,000 req/s
# Read/write ratio: ~100:1 → read-heavy → add read replicas and caching

# Step 2: Storage estimates
TWEET_SIZE_BYTES = 300          # text, metadata
MEDIA_FRACTION   = 0.1          # 10% of tweets have media
MEDIA_SIZE_BYTES = 1_000_000    # 1MB average

tweets_per_day  = DAU * TWEETS_PER_USER_DAY      # 200M tweets/day
text_storage    = tweets_per_day * TWEET_SIZE_BYTES / 1e9   # ~60 GB/day
media_storage   = tweets_per_day * MEDIA_FRACTION * MEDIA_SIZE_BYTES / 1e12  # ~20 TB/day

# 5-year storage:
text_total  = text_storage  * 365 * 5  # ~110 TB text
media_total = media_storage * 365 * 5  # ~36 PB media

print(f"Write: {WRITE_RPS:,.0f} rps")
print(f"Read:  {READ_RPS:,.0f} rps")
print(f"Text:  {text_total:,.0f} TB / 5 years")
print(f"Media: {media_total:,.0f} PB / 5 years")`,
    },
    {
      heading: "High-Level Design Patterns",
      body: `Most system design interview questions can be addressed with a common set of patterns. Recognise the pattern and apply it.`,
      items: [
        "**Stateless + load balancer**: for any scalable API. Stateless servers + shared session store (Redis). Horizontal scaling is trivial.",
        "**Cache + database**: read-heavy systems. Cache popular data in Redis. Use cache-aside or read-through. Account for cache invalidation.",
        "**Message queue for async work**: email sending, image processing, notifications. Decouple the API from the work. Use a dead-letter queue for failures.",
        "**Primary + read replicas**: read-heavy database load. Route writes to primary, reads to replicas. Accept replication lag for non-critical reads.",
        "**CDN for static and semi-static content**: all images, JS/CSS, and cacheable API responses. Massive latency and cost reduction.",
        "**Consistent hashing for distributed cache**: when you need multiple cache nodes, use consistent hashing to minimise cache misses when adding/removing nodes.",
        "**Event sourcing / CDC**: for eventual consistency between services. Services subscribe to events via Kafka instead of calling each other directly.",
      ],
    },
    {
      heading: "Common Deep-Dive Questions",
      body: `Interviewers typically pick one area to probe. Prepare concrete answers for these questions.`,
      code: `# "How do you handle hot partitions / hot keys in your cache?"
# → Micro-sharding: replicate the hot key to N slots (user:42:0, user:42:1, ..., user:42:N)
#   Each request picks a random slot → distributes load across N nodes
# → Alternatively: use a local in-process cache for the hottest 1% of keys
#   with a very short TTL (1-5s) to avoid stale data issues

# "How do you implement a distributed lock?"
# Redis SETNX with expiry (Redlock for multi-node)
import redis, uuid, time

def acquire_lock(r, key: str, ttl: int = 10) -> str | None:
    lock_id = str(uuid.uuid4())
    if r.set(key, lock_id, nx=True, ex=ttl):   # SET if Not eXists
        return lock_id
    return None

def release_lock(r, key: str, lock_id: str):
    val = r.get(key)
    if val == lock_id:   # only release if we hold it (Lua script for atomicity)
        r.delete(key)

# "How does your system handle a database primary failure?"
# → Replica promotion (Patroni, AWS RDS Multi-AZ): ~30-60s automatic failover
# → During failover: write requests queue at the app (connection retry with backoff)
# → Max downtime: ~60s for managed RDS. RPO=0 for synchronous replication.

# "How do you prevent duplicate processing in your job queue?"
# → Idempotency key: store processed job IDs in Redis (SET with NX + TTL)
#   Before processing: SET job:{id} "done" NX EX 86400
#   If SET returns nil → already processed → skip
# → Database upsert: INSERT INTO processed_jobs ON CONFLICT DO NOTHING`,
    },
    {
      heading: "Trade-off Discussion",
      body: `Interviewers evaluate your ability to reason about trade-offs, not just recite patterns. For every design decision, be ready to explain what you gave up.`,
      items: [
        "**SQL vs NoSQL**: SQL gives ACID, joins, flexible queries. NoSQL gives horizontal write scaling and flexible schema. Only pick NoSQL if you have a concrete reason.",
        "**Consistency vs availability**: acknowledge the CAP trade-off. For financial data, choose consistency. For social feeds, eventual consistency is fine.",
        "**Cache TTL length**: longer TTL = better performance, more stale data. Shorter TTL = fresher data, more origin load. Match to how often data actually changes.",
        "**Synchronous vs asynchronous**: sync gives immediate feedback but creates coupling and latency. Async decouples but adds eventual consistency and observability complexity.",
        "**Microservices vs monolith**: be honest — microservices add complexity. For an interview system design, a modular monolith is often the right starting point.",
        "**Pull vs push notifications**: push (WebSocket/SSE) is real-time but costly per connection. Pull (polling) is simpler but wasteful. Use push for real-time features, long-polling for near-real-time.",
      ],
    },
  ],
};
