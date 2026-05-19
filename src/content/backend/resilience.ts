export const content = {
  title: "Resilience & Error Handling",
  sections: [
    {
      heading: "Why Resilience?",
      body: `In distributed systems, **failures are not exceptional — they're routine**. Networks drop packets, services time out, databases lag, third-party APIs go down. A resilient system is designed to handle these failures gracefully: degrading instead of crashing, retrying intelligently, and containing failures so they don't cascade.`,
      items: [
        "**Cascading failures** — one slow service causes all callers to pile up waiting, exhausting their resources and failing too",
        "**Timeout** — don't wait forever for a response. Set a deadline and fail fast.",
        "**Retry** — transient failures (network hiccup, brief overload) often resolve on retry",
        "**Circuit breaker** — stop calling a failing service to let it recover, instead of amplifying the load",
        "**Fallback** — return a cached or default response when the upstream fails",
        "**Bulkhead** — isolate failures in one component from spreading to others",
      ],
    },
    {
      heading: "Timeouts",
      body: `**Every** network call must have a timeout. An operation that never times out will eventually block all worker threads during an outage, taking down your service too.`,
      code: `import httpx

# ✅ Always set connect and read timeouts
async def call_payment_service(order_id: int) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://payment-service/charge",
            json={"order_id": order_id},
            timeout=httpx.Timeout(
                connect=2.0,    # max 2s to establish connection
                read=5.0,       # max 5s waiting for response
                write=2.0,
                pool=1.0,
            )
        )
        response.raise_for_status()
        return response.json()

# Database query timeout (SQLAlchemy)
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("SET statement_timeout = '5000'"))  # 5s per query
    result = conn.execute(text("SELECT * FROM big_table"))

# FastAPI: request-level timeout (starlette)
from asyncio import wait_for, TimeoutError

@router.get("/slow-endpoint")
async def slow_endpoint():
    try:
        result = await wait_for(expensive_operation(), timeout=10.0)
        return result
    except TimeoutError:
        raise HTTPException(503, "Operation timed out")`,
    },
    {
      heading: "Retries with Exponential Backoff",
      body: `Retrying immediately after failure usually makes things worse — if the service is overloaded, another instant request adds more load. **Exponential backoff** waits progressively longer between retries. **Jitter** adds randomness to prevent synchronized retries from all clients hitting at the same time (thundering herd).`,
      code: `import asyncio, random

async def retry_with_backoff(
    fn,
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    retryable_exceptions: tuple = (httpx.TransportError, httpx.TimeoutException),
):
    for attempt in range(max_retries + 1):
        try:
            return await fn()
        except retryable_exceptions as e:
            if attempt == max_retries:
                raise   # last attempt — propagate the error

            # Exponential backoff with full jitter
            delay = min(max_delay, base_delay * (2 ** attempt))
            jitter = random.uniform(0, delay)
            await asyncio.sleep(jitter)
        except Exception:
            raise   # non-retryable — fail immediately

# Usage
result = await retry_with_backoff(
    lambda: call_payment_service(order_id)
)

# With tenacity library (more ergonomic)
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=60),
    retry=retry_if_exception_type(httpx.TransportError),
)
async def call_payment_service(order_id: int): ...`,
    },
    {
      heading: "Circuit Breaker",
      body: `A **circuit breaker** wraps external calls and monitors for failures. When failures exceed a threshold, it "opens" and immediately fails all subsequent calls without attempting the operation — giving the failing service time to recover.`,
      code: `# Circuit breaker states:
# CLOSED  → normal operation, calls go through
# OPEN    → failures exceeded threshold, calls fail immediately (fail-fast)
# HALF-OPEN → after a cooldown, allow one probe request to test recovery

from enum import Enum
import time

class CircuitBreaker:
    def __init__(self, failure_threshold=5, cooldown=60):
        self.failure_count   = 0
        self.failure_threshold = failure_threshold
        self.cooldown        = cooldown
        self.state           = "CLOSED"
        self.opened_at       = None

    def call(self, fn, *args, **kwargs):
        if self.state == "OPEN":
            if time.time() - self.opened_at > self.cooldown:
                self.state = "HALF-OPEN"
            else:
                raise Exception("Circuit open — service unavailable")

        try:
            result = fn(*args, **kwargs)
            if self.state == "HALF-OPEN":
                self.reset()   # recovery confirmed
            return result
        except Exception as e:
            self.record_failure()
            raise

    def record_failure(self):
        self.failure_count += 1
        if self.failure_count >= self.failure_threshold:
            self.state    = "OPEN"
            self.opened_at = time.time()

    def reset(self):
        self.failure_count = 0
        self.state = "CLOSED"

# Libraries: pybreaker (Python), resilience4j (Java), Polly (.NET)
# In Kubernetes: Istio service mesh provides circuit breaking at the infrastructure level`,
    },
    {
      heading: "Fallbacks & Graceful Degradation",
      body: `When a dependency fails, don't fail the whole request if you can provide a degraded but useful response. **Graceful degradation** keeps the core experience working even when non-critical components are down.`,
      items: [
        "**Cached fallback** — serve stale cached data when the live source is unavailable. Better than an error page.",
        "**Default response** — return an empty list or default value rather than an error for non-critical data",
        "**Feature disabling** — if the recommendation engine is down, return popular items instead. If search is slow, disable it and show browse navigation.",
        "**Bulkhead pattern** — use separate thread pools / connection pools for different dependencies. A slow external API won't exhaust the pool used for your database.",
        "**Health-based routing** — load balancers remove unhealthy instances from rotation. Within your code, maintain a list of healthy upstream addresses.",
        "**Design for partial failure**: identify which parts of your system are critical (auth, payment) vs nice-to-have (recommendations, social features) and handle each appropriately.",
      ],
    },
  ],
};
