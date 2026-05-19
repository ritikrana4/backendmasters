export const content = {
  title: "Background Jobs & Task Queues",
  sections: [
    {
      heading: "Why Background Jobs?",
      body: `Some operations are too slow, too resource-intensive, or too unreliable to run inside an HTTP request handler. **Background jobs** move this work out of the request cycle so the API responds instantly while the work continues asynchronously.`,
      items: [
        "**Email and notifications** — sending email can take 200–500ms; do it in the background",
        "**Image/video processing** — resizing, transcoding, generating thumbnails",
        "**External API calls** — webhooks, third-party integrations that might be slow or flaky",
        "**Report generation** — complex SQL queries that take seconds to run",
        "**Batch operations** — processing thousands of records without blocking",
        "**Scheduled tasks** — sending digests, cleaning old data, syncing external systems",
      ],
    },
    {
      heading: "Celery — Python Task Queue",
      body: `**Celery** is the most widely used Python task queue. Workers run as separate processes, pull tasks from a broker (Redis or RabbitMQ), execute them, and optionally store results.`,
      code: `# celery_app.py
from celery import Celery

app = Celery(
    "myapp",
    broker="redis://localhost:6379/0",   # task queue
    backend="redis://localhost:6379/1"   # result storage
)

app.conf.update(
    task_serializer="json",
    result_expires=3600,  # results expire after 1 hour
)

# tasks.py
from celery_app import app
from services import email_service

@app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=60  # wait 60s between retries
)
def send_welcome_email(self, user_id: int):
    try:
        user = db.get(User, user_id)
        email_service.send(user.email, template="welcome")
    except email_service.TransientError as exc:
        raise self.retry(exc=exc)  # retry on transient errors

# FastAPI route: enqueue and return immediately
@router.post("/users")
async def create_user(data: UserCreate):
    user = create_user_in_db(data)
    send_welcome_email.delay(user.id)  # enqueue, don't wait
    return {"id": user.id}

# Start worker
# celery -A celery_app worker --loglevel=info --concurrency=4`,
    },
    {
      heading: "Celery Beat — Scheduled Tasks",
      body: `**Celery Beat** is a scheduler that triggers tasks on a schedule — daily digests, hourly sync jobs, weekly cleanup. It's the Celery equivalent of cron.`,
      code: `# celery_app.py — beat schedule
from celery.schedules import crontab

app.conf.beat_schedule = {
    # Run every day at 8am
    "send-daily-digest": {
        "task": "tasks.send_daily_digest",
        "schedule": crontab(hour=8, minute=0),
    },
    # Run every 5 minutes
    "sync-external-data": {
        "task": "tasks.sync_data",
        "schedule": 300,   # seconds
    },
    # Run every Monday at midnight
    "weekly-cleanup": {
        "task": "tasks.cleanup_old_records",
        "schedule": crontab(day_of_week=1, hour=0, minute=0),
    },
}

# Start beat scheduler (separate process from worker)
# celery -A celery_app beat --loglevel=info
# celery -A celery_app worker --loglevel=info`,
    },
    {
      heading: "Idempotency in Background Jobs",
      body: `Background jobs can be retried — on failure, timeout, or worker crash. **Idempotent jobs** produce the same result whether run once or many times. Non-idempotent jobs can cause double-charges, duplicate emails, or data corruption.`,
      code: `# Non-idempotent: charges customer twice if retried!
@app.task
def charge_customer(order_id: int):
    order = db.get(Order, order_id)
    stripe.charge(order.customer_id, order.total)  # called twice = charged twice

# Idempotent: check-then-act
@app.task
def charge_customer(order_id: int):
    order = db.get(Order, order_id)

    # Guard: only charge if not already charged
    if order.payment_status == "charged":
        return  # already done — safe to exit

    result = stripe.charge(
        order.customer_id,
        order.total,
        idempotency_key=f"order-{order_id}"  # Stripe deduplicates on their end
    )

    order.payment_status = "charged"
    order.stripe_charge_id = result.id
    db.commit()

# Distributed lock: prevent concurrent execution of the same job
def process_user_report(user_id: int):
    lock_key = f"lock:report:{user_id}"

    with redis_lock(lock_key, timeout=60):  # release after 60s
        # Only one worker runs this for each user_id at a time
        generate_report(user_id)`,
    },
    {
      heading: "Job Monitoring & Dead Letter Queues",
      body: `Production task queues need observability. Flower (Celery UI), queue depth metrics, and dead-letter queues for failed tasks are essential.`,
      items: [
        "**Flower** — real-time web UI for Celery: active workers, task history, retry counts, queue depths",
        "**Dead Letter Queue (DLQ)** — tasks that fail after all retries are moved here. Never silently drop failed tasks — inspect and reprocess them.",
        "**Queue depth monitoring** — alert when a queue grows beyond a threshold (worker is down or too slow)",
        "**Task timeout** — always set `time_limit` and `soft_time_limit` to prevent runaway tasks from holding workers indefinitely",
        "**Retry with exponential backoff** — don't retry immediately; wait longer on each failure: 30s, 60s, 120s, 300s",
        "**Alerting**: alert on task failure rate, DLQ growth, and queue depth — these are signals that something is wrong in production",
      ],
    },
  ],
};
