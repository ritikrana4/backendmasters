export const content = {
  title: "Webhooks & Async APIs",
  sections: [
    {
      heading: "What is a Webhook?",
      body: `A **webhook** is an HTTP callback — instead of your app polling an external service for updates, the external service calls your API when something happens. Stripe calls your endpoint when a payment succeeds; GitHub calls it when a PR is merged; Twilio calls it when an SMS is received.`,
      items: [
        "**Push vs pull**: polling wastes requests checking for updates. Webhooks push updates as they happen.",
        "**Endpoint**: you expose an HTTP endpoint (usually POST). The external service sends an HTTP request to it with event data.",
        "**Signature verification**: the sender signs the payload with a shared secret. You verify the signature before processing — prevents forged webhooks.",
        "**Idempotency**: webhooks may be delivered more than once (retry on failure). Your handler must be idempotent — processing the same event twice should be safe.",
        "**Common webhook providers**: Stripe, GitHub, Shopify, Twilio, SendGrid, Slack, PagerDuty",
      ],
    },
    {
      heading: "Receiving Webhooks Securely",
      body: `Never trust an incoming webhook without verifying it was sent by the legitimate service. Verify the signature before processing the payload.`,
      code: `# Stripe webhook signature verification
import hmac, hashlib
from fastapi import Request, HTTPException

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload   = await request.body()
    signature = request.headers.get("Stripe-Signature")

    # Extract timestamp and signature from header
    # sig_header format: t=1492774577,v1=5257a869...,v0=6ffbb59...
    parts    = dict(item.split("=", 1) for item in signature.split(","))
    ts       = parts["t"]
    expected = parts["v1"]

    # Reconstruct the signed payload
    signed_payload = f"{ts}.{payload.decode()}"

    # Compute HMAC-SHA256
    computed = hmac.new(
        STRIPE_WEBHOOK_SECRET.encode(),
        signed_payload.encode(),
        hashlib.sha256
    ).hexdigest()

    # Constant-time comparison (prevents timing attacks)
    if not hmac.compare_digest(computed, expected):
        raise HTTPException(400, "Invalid signature")

    # Reject events older than 5 minutes (replay attack prevention)
    if abs(time.time() - int(ts)) > 300:
        raise HTTPException(400, "Timestamp too old")

    event = json.loads(payload)
    await handle_stripe_event(event)
    return {"status": "ok"}`,
    },
    {
      heading: "Processing Webhooks Reliably",
      body: `Webhook handlers should respond immediately (within 5 seconds) and process work asynchronously. A slow or failing handler causes the sender to retry, leading to duplicates.`,
      code: `# Pattern: acknowledge immediately, enqueue for processing
@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    verify_stripe_signature(payload, request.headers["Stripe-Signature"])

    event = json.loads(payload)

    # Deduplicate: check if we've already processed this event ID
    if await redis.exists(f"processed_event:{event['id']}"):
        return {"status": "already_processed"}  # idempotent

    # Enqueue for async processing (return 200 immediately)
    await task_queue.enqueue("process_stripe_event", event)

    # Mark as received (with TTL longer than max retry window)
    await redis.setex(f"processed_event:{event['id']}", 86400, "1")

    return {"status": "accepted"}  # respond fast

# Async handler (runs in background worker)
async def process_stripe_event(event: dict):
    if event["type"] == "payment_intent.succeeded":
        order_id = event["data"]["object"]["metadata"]["order_id"]
        await fulfill_order(order_id)

    elif event["type"] == "customer.subscription.deleted":
        customer_id = event["data"]["object"]["customer"]
        await cancel_subscription(customer_id)`,
    },
    {
      heading: "Sending Webhooks",
      body: `If you're building a platform that sends webhooks to customers, you need reliable delivery with retries, failure handling, and good DX.`,
      code: `# Webhook delivery with retries
import httpx, asyncio
from models import WebhookEndpoint, WebhookDelivery

async def deliver_webhook(endpoint_id: int, event_type: str, payload: dict):
    endpoint = db.get(WebhookEndpoint, endpoint_id)

    # Sign the payload
    body = json.dumps(payload).encode()
    signature = hmac.new(
        endpoint.secret.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    attempt = 0
    delays  = [0, 30, 60, 300, 1800]  # retry schedule in seconds

    for delay in delays:
        if delay > 0:
            await asyncio.sleep(delay)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    endpoint.url,
                    content=body,
                    headers={
                        "Content-Type": "application/json",
                        "X-Webhook-Signature": f"sha256={signature}",
                        "X-Event-Type": event_type,
                        "X-Delivery-ID": str(delivery_id),
                    },
                    timeout=10,
                )

            if 200 <= response.status_code < 300:
                log_delivery(delivery_id, "success", response.status_code)
                return

        except httpx.TimeoutException:
            pass

        attempt += 1
        log_delivery(delivery_id, "failed_attempt", attempt=attempt)

    # All retries exhausted
    log_delivery(delivery_id, "failed_permanently")
    notify_customer(endpoint.user_id, "Webhook delivery failed")`,
    },
    {
      heading: "Async API Patterns",
      body: `For long-running operations, return immediately with a job ID and let the client poll or receive a webhook when complete.`,
      items: [
        "**Request-response (sync)**: works for operations under ~5 seconds. For longer operations, use async.",
        "**Polling**: POST to start a job, get a job ID back, GET the status. Simple, works everywhere.",
        "**Callbacks/webhooks**: register a URL when starting the job. We call it when done. More efficient than polling for long jobs.",
        "**WebSockets**: keep a connection open and push status updates in real time. Good for interactive workflows.",
        "**202 Accepted**: use this HTTP status code for async operations — means 'request received, processing started'. Include a Location header pointing to the job status endpoint.",
      ],
      code: `# Async operation pattern: 202 Accepted + polling

# Start a long-running export
POST /exports
{ "format": "csv", "filters": {...} }
→ HTTP 202 Accepted
  Location: /exports/job_abc123
  { "job_id": "job_abc123", "status": "queued" }

# Poll for status
GET /exports/job_abc123
→ { "job_id": "job_abc123", "status": "processing", "progress": 45 }

GET /exports/job_abc123
→ {
    "job_id": "job_abc123",
    "status": "completed",
    "download_url": "https://cdn.example.com/exports/report.csv",
    "expires_at": "2024-05-20T12:00:00Z"
  }`,
    },
  ],
};
