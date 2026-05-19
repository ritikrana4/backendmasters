export const content = {
  title: "Logging & Observability",
  sections: [
    {
      heading: "The Three Pillars of Observability",
      body: `**Observability** is the ability to understand what a system is doing from its external outputs. Without observability, production issues become guesswork. The three pillars give you different lenses into system behavior.`,
      items: [
        "**Logs** — append-only records of discrete events: errors, requests, state changes. Answerable: what happened?",
        "**Metrics** — numeric measurements over time: request rate, error rate, latency percentiles, CPU. Answerable: is something wrong right now?",
        "**Traces** — a record of a request's journey through multiple services. Answerable: why is this specific request slow?",
        "In a monolith, logs alone often suffice. In microservices, all three are necessary.",
        "**Tooling**: logs → Elasticsearch/Loki/Datadog. Metrics → Prometheus/Grafana. Traces → Jaeger/Zipkin/Tempo.",
      ],
    },
    {
      heading: "Structured Logging",
      body: `**Structured logs** emit JSON instead of plain text, making them machine-parseable and searchable. Never log human-readable strings that require regex to parse in production.`,
      code: `# ❌ Unstructured (hard to query, filter, or alert on)
logger.info(f"User 42 logged in from 192.168.1.1")
logger.error(f"Payment failed for order 123: timeout after 5000ms")

# ✅ Structured JSON (grep, filter, aggregate in any log platform)
import structlog, logging

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.processors.JSONRenderer(),
    ]
)

log = structlog.get_logger()

log.info("user.login", user_id=42, ip="192.168.1.1", success=True)
# {"timestamp": "2024-01-15T10:23:45Z", "level": "info",
#  "event": "user.login", "user_id": 42, "ip": "192.168.1.1", "success": true}

log.error("payment.failed", order_id=123, error="timeout", duration_ms=5000)
# {"level": "error", "event": "payment.failed", "order_id": 123, "error": "timeout"}

# FastAPI: log every request with timing
import time

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.monotonic()
    response = await call_next(request)
    duration = (time.monotonic() - start) * 1000

    log.info("http.request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        duration_ms=round(duration, 2),
        request_id=request.headers.get("X-Request-ID"),
    )
    return response`,
    },
    {
      heading: "Log Levels",
      body: `Use log levels deliberately. Logging everything at DEBUG in production is as useless as logging nothing.`,
      items: [
        "**DEBUG** — detailed diagnostic info for development. Never in production (too noisy, expensive).",
        "**INFO** — normal application events: request received, user logged in, job completed. Low cardinality.",
        "**WARNING** — something unexpected but handled: retried a failed request, fell back to default, deprecated API used.",
        "**ERROR** — something failed that shouldn't have: unhandled exception, database error, external service failure. Always requires investigation.",
        "**CRITICAL / FATAL** — system is unusable: cannot connect to database, out of memory. Wakes people up at 3am.",
        "Production default: **INFO**. Set **DEBUG** on specific modules when investigating an issue. Never **DEBUG** globally in production.",
      ],
    },
    {
      heading: "Request IDs & Correlation",
      body: `In distributed systems, a single user action triggers requests across multiple services. **Request IDs** (correlation IDs) thread through all these calls so you can trace a complete transaction in logs.`,
      code: `# Generate or propagate request ID on every request
import uuid

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    # Accept request ID from upstream, or generate a new one
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())

    # Bind to structured log context for this request
    with structlog.contextvars.bind_contextvars(request_id=request_id):
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

# Now every log line in this request has request_id attached:
# {"event": "db.query", "request_id": "abc-123", "duration_ms": 45}
# {"event": "cache.miss", "request_id": "abc-123"}
# {"event": "http.request", "request_id": "abc-123", "status": 200}

# Propagate to downstream services
headers = {"X-Request-ID": request_id}
response = httpx.get("https://payment-service/charge", headers=headers)`,
    },
    {
      heading: "Health Checks & Metrics",
      body: `**Health checks** let load balancers and orchestrators know if your service is ready to serve traffic. **Metrics** give you quantitative insight into performance and capacity.`,
      code: `# Health check endpoint — load balancers poll this
@router.get("/health")
async def health_check():
    checks = {}

    # Check database connectivity
    try:
        db.execute("SELECT 1")
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {e}"

    # Check Redis
    try:
        redis.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {e}"

    status = 200 if all(v == "ok" for v in checks.values()) else 503
    return JSONResponse({"status": "ok" if status == 200 else "degraded",
                         "checks": checks}, status_code=status)

# Prometheus metrics (Python: prometheus-client)
from prometheus_client import Counter, Histogram, generate_latest

REQUEST_COUNT = Counter("http_requests_total", "Total requests", ["method", "path", "status"])
REQUEST_LATENCY = Histogram("http_request_duration_seconds", "Request latency", ["path"])

@app.middleware("http")
async def record_metrics(request: Request, call_next):
    with REQUEST_LATENCY.labels(path=request.url.path).time():
        response = await call_next(request)
    REQUEST_COUNT.labels(request.method, request.url.path, response.status_code).inc()
    return response

@router.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")`,
    },
  ],
};
