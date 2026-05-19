import type { DiagramConfig } from "@/components/FlowDiagram";

const observabilityDiagram: DiagramConfig = {
  width: 760,
  height: 240,
  caption: "Observability stack: app servers emit metrics to Prometheus, logs to Elasticsearch, and traces to Jaeger — Grafana unifies all three into dashboards",
  nodes: [
    { id: "app1",    type: "server",   label: "App Server 1",  x: 80,  y: 120 },
    { id: "app2",    type: "server",   label: "App Server 2",  x: 80,  y: 200 },
    { id: "prom",    type: "cache",    label: "Prometheus",    sublabel: "metrics", x: 330, y: 60  },
    { id: "es",      type: "database", label: "Elasticsearch", sublabel: "logs",    x: 330, y: 155 },
    { id: "jaeger",  type: "queue",    label: "Jaeger",        sublabel: "traces",  x: 330, y: 230 },
    { id: "grafana", type: "client",   label: "Grafana",       x: 620, y: 145 },
  ],
  edges: [
    { from: "app1", to: "prom",    label: "scrape /metrics" },
    { from: "app2", to: "prom",    dashed: true },
    { from: "app1", to: "es",      label: "log stream" },
    { from: "app2", to: "es",      dashed: true },
    { from: "app1", to: "jaeger",  label: "spans" },
    { from: "app2", to: "jaeger",  dashed: true },
    { from: "prom",   to: "grafana" },
    { from: "es",     to: "grafana" },
    { from: "jaeger", to: "grafana" },
  ],
};

export const content = {
  title: "Monitoring & Observability",
  sections: [
    {
      heading: "The Three Pillars of Observability",
      diagram: observabilityDiagram,
      body: `**Observability** is the ability to understand the internal state of a system from its external outputs. A system is observable if, when something goes wrong, you can ask "what is broken and why?" without deploying new code.

The three pillars each answer different questions. **Metrics** are numeric measurements over time: request rate, error rate, latency percentiles, CPU usage. They're cheap to store, fast to query, and great for dashboards and alerting. **Logs** are time-stamped text records of discrete events: every HTTP request, every exception, every database query. They're expensive to store at scale but essential for debugging — metrics tell you *something is wrong*, logs tell you *what exactly happened*. **Traces** follow a single request as it travels through multiple services, recording how long each service and operation took. Traces answer "why is this specific user's request slow?" — a question metrics and logs can't answer alone.

The **RED method** (Rate, Errors, Duration) and **USE method** (Utilisation, Saturation, Errors) are frameworks for deciding which metrics matter. For every service, instrument at least: requests per second, error rate, and p99 latency. For every resource (CPU, memory, disk), instrument: utilisation and saturation.`,
      items: [
        "`Metrics` — numeric time series; cheap to store; ideal for dashboards and alerting (Prometheus)",
        "`Logs` — discrete event records; expensive at scale; essential for debugging root causes (ELK)",
        "`Traces` — distributed request paths across services; answers latency questions (Jaeger, Tempo)",
        "`RED method` — Rate (req/s), Errors (error rate), Duration (latency) — instrument every service",
        "`SLI/SLO/SLA` — SLI is the metric, SLO is the target (99.9% uptime), SLA is the contract",
      ],
    },
    {
      heading: "Metrics with Prometheus & Grafana",
      body: `**Prometheus** is a pull-based metrics system. Your application exposes a \`/metrics\` HTTP endpoint in the Prometheus text format; Prometheus scrapes it on a configurable interval (default 15 s) and stores the data in its time-series database. This pull model makes service discovery simple and avoids overwhelming the collector with metric pushes from thousands of instances.

Prometheus has four metric types: **Counter** (monotonically increasing: total requests, total errors), **Gauge** (current value: active connections, memory usage), **Histogram** (distribution of values, used to compute percentiles: request latency), and **Summary** (similar to histogram, computed client-side).

**Grafana** connects to Prometheus (and many other data sources) and provides dashboards, alerting, and on-call routing. **PromQL** is Prometheus's query language — powerful but has a learning curve. The \`rate()\` function is essential: it converts a counter into a per-second rate over a time window, correctly handling counter resets.`,
      code: `from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time

# Counters: always increasing, reset on process restart
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"]
)

# Histogram: track request duration, used to compute percentiles
REQUEST_DURATION = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]
)

# Gauge: current value (can go up and down)
ACTIVE_CONNECTIONS = Gauge("active_connections", "Currently open connections")

# Usage in a Flask/FastAPI middleware
def track_request(method: str, endpoint: str, status: int, duration: float):
    REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=str(status)).inc()
    REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)

# Expose /metrics endpoint on port 9090
start_http_server(9090)

# --- PromQL examples ---
# Requests per second over 5 min window (rate of a counter)
# rate(http_requests_total[5m])
#
# Error rate (ratio of 5xx to total)
# rate(http_requests_total{status=~"5.."}[5m])
#   / rate(http_requests_total[5m])
#
# 99th percentile latency
# histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))`,
    },
    {
      heading: "Structured Logging",
      body: `Plain text logs (\`"ERROR: something went wrong"\`) are hard to query at scale. **Structured logging** emits log records as JSON objects with consistent fields. Every log entry has the same machine-readable shape: timestamp, level, service name, trace ID, and the message. This makes logs filterable and aggregatable in tools like Elasticsearch, Loki, or CloudWatch Insights.

The **ELK stack** (Elasticsearch + Logstash + Kibana) or the lighter **EFK** (Elasticsearch + Fluentd + Kibana) is a common self-hosted logging stack. In cloud environments, teams often use managed services: AWS CloudWatch Logs, GCP Cloud Logging, or Datadog.

The most important field to add to every log: the **trace ID**. When a request is slow or errors, you can filter logs by trace ID and see every log line from every service that handled that specific request. This bridges logs and traces.`,
      code: `import logging
import json
import sys
from typing import Any

class JSONFormatter(logging.Formatter):
    """Emit every log record as a single JSON line."""
    def format(self, record: logging.LogRecord) -> str:
        log_entry: dict[str, Any] = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S.%fZ"),
            "level":     record.levelname,
            "logger":    record.name,
            "message":   record.getMessage(),
            "service":   "user-service",
        }
        # Include any extra fields passed via extra={...}
        for key in ("trace_id", "user_id", "request_id", "duration_ms"):
            if hasattr(record, key):
                log_entry[key] = getattr(record, key)
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)

def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger

logger = get_logger("app")

# Usage
logger.info("User logged in",
    extra={"user_id": "u-123", "trace_id": "t-abc", "duration_ms": 42})
logger.error("Payment failed",
    extra={"user_id": "u-456", "trace_id": "t-xyz", "amount": 99.99},
    exc_info=True)
# Output: {"timestamp": "...", "level": "INFO", "message": "User logged in",
#           "user_id": "u-123", "trace_id": "t-abc", "duration_ms": 42}`,
    },
    {
      heading: "Distributed Tracing",
      body: `In a microservices architecture, a single user request might touch 10 services. If the request takes 2 seconds, where is the time spent? Metrics can't tell you — they're aggregated across all requests. Logs from individual services are disconnected. **Distributed tracing** solves this by propagating a trace context (trace ID + span ID) in HTTP headers as a request moves between services. Each service records a **span**: start time, end time, service name, operation name, and any relevant tags.

**OpenTelemetry (OTel)** is the open standard for tracing (and metrics and logs). It provides SDKs for every language that handle context propagation and span creation. You configure an **exporter** to send spans to a backend (Jaeger, Grafana Tempo, AWS X-Ray, Datadog). The auto-instrumentation libraries for popular frameworks (FastAPI, Django, SQLAlchemy, Redis) give you traces with zero manual code.

The most valuable traces to instrument: incoming HTTP requests (automatic), outgoing HTTP calls to other services (automatic), database queries (automatic), and any slow business logic operations (manual spans).`,
      code: `from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

# Configure the tracer to send spans to Jaeger/Tempo via OTLP
provider = TracerProvider()
provider.add_span_processor(
    BatchSpanProcessor(
        OTLPSpanExporter(endpoint="http://jaeger:4317")
    )
)
trace.set_tracer_provider(provider)

# Auto-instrument FastAPI (records every request as a span)
FastAPIInstrumentor().instrument()
# Auto-instrument SQLAlchemy (records every query as a span)
SQLAlchemyInstrumentor().instrument(engine=engine)

# Manual span for a specific operation
tracer = trace.get_tracer("user-service")

async def process_order(order_id: str) -> dict:
    with tracer.start_as_current_span("process_order") as span:
        span.set_attribute("order.id", order_id)
        span.set_attribute("service.version", "1.4.0")

        items = await fetch_order_items(order_id)    # auto-traced DB call
        span.set_attribute("order.item_count", len(items))

        with tracer.start_as_current_span("calculate_shipping"):
            shipping = await shipping_service.calculate(items)  # outgoing HTTP auto-traced

        return {"order_id": order_id, "shipping": shipping}`,
    },
  ],
};
