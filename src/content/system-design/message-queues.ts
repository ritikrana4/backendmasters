import type { DiagramConfig } from "@/components/FlowDiagram";

const mqDiagram: DiagramConfig = {
  width: 760,
  height: 230,
  caption: "Producer-consumer pattern: multiple producers write to a partitioned queue; consumer groups process messages independently",
  nodes: [
    { id: "p1",  type: "server", label: "Producer A",   x: 75,  y: 75  },
    { id: "p2",  type: "server", label: "Producer B",   x: 75,  y: 155 },
    { id: "q",   type: "queue",  label: "Message Queue", sublabel: "Kafka topic", x: 300, y: 115 },
    { id: "c1",  type: "server", label: "Consumer 1",   x: 545, y: 65  },
    { id: "c2",  type: "server", label: "Consumer 2",   x: 545, y: 115 },
    { id: "c3",  type: "server", label: "Consumer 3",   x: 545, y: 165 },
    { id: "dlq", type: "queue",  label: "Dead Letter Q", sublabel: "failed msgs", x: 690, y: 65 },
  ],
  edges: [
    { from: "p1", to: "q" },
    { from: "p2", to: "q" },
    { from: "q",  to: "c1" },
    { from: "q",  to: "c2" },
    { from: "q",  to: "c3" },
    { from: "c1", to: "dlq", dashed: true, label: "failed" },
  ],
};

export const content = {
  title: "Message Queue Architecture",
  sections: [
    {
      heading: "Why Message Queues?",
      diagram: mqDiagram,
      body: `Message queues **decouple** producers (services that generate work) from consumers (services that process it). Without a queue, a producer must wait for the consumer to process each request synchronously — if the consumer is slow or down, the producer blocks.

With a queue, the producer writes a message and continues immediately. The consumer reads at its own pace. This enables **asynchronous processing**, absorbs traffic spikes (the queue buffers excess messages), and allows independent scaling of producers and consumers.`,
      items: [
        "**Decoupling**: producers don't know about consumers and vice versa. Add consumers without changing producers.",
        "**Buffering**: a sudden spike in write traffic fills the queue rather than overwhelming the consumer. Consumers drain it at a steady rate.",
        "**Fan-out**: multiple consumer groups can independently consume the same message (Kafka topics, SNS subscriptions).",
        "**Retry & durability**: messages persist until acknowledged. Failed messages can be retried automatically and eventually moved to a dead-letter queue.",
      ],
    },
    {
      heading: "At-Least-Once vs Exactly-Once",
      body: `Delivery guarantees define what happens when a consumer crashes after reading but before acknowledging a message.

**At-most-once**: messages are deleted as soon as they're delivered. Fast, but messages can be lost if the consumer crashes. Use for non-critical events (analytics, logs).
**At-least-once**: messages are re-delivered if not acknowledged. No data loss, but consumers may process the same message twice. Use idempotent consumers.
**Exactly-once**: complex and expensive — requires coordination between the queue and the consumer's downstream store. Kafka transactions + idempotent producers can achieve it.`,
      code: `# At-least-once with idempotent consumer (SQS example)
import boto3, json

sqs = boto3.client("sqs", region_name="us-east-1")
QUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123/orders"
PROCESSED_IDS = set()   # in production: Redis or DB

def process_message(msg: dict):
    order_id = msg["order_id"]

    # Idempotency check: skip if already processed
    if order_id in PROCESSED_IDS:
        print(f"Skipping duplicate: {order_id}")
        return

    # Process the order
    charge_customer(msg["user_id"], msg["amount"])
    PROCESSED_IDS.add(order_id)

def poll_loop():
    while True:
        resp = sqs.receive_message(
            QueueUrl=QUEUE_URL,
            MaxNumberOfMessages=10,
            VisibilityTimeout=30,   # message hidden from others for 30s while processing
            WaitTimeSeconds=20,     # long polling — waits up to 20s for messages
        )
        for raw in resp.get("Messages", []):
            body = json.loads(raw["Body"])
            try:
                process_message(body)
                sqs.delete_message(QueueUrl=QUEUE_URL,
                                   ReceiptHandle=raw["ReceiptHandle"])
            except Exception as e:
                print(f"Failed: {e}")
                # Don't delete — message returns to queue after VisibilityTimeout
                # After N retries → automatically moved to dead-letter queue`,
    },
    {
      heading: "Kafka Architecture",
      body: `**Apache Kafka** is a distributed log, not a traditional queue. Messages are written to **topics** (named streams) and stored durably on disk. Consumers track their own position (**offset**) in the log — they can re-read messages, process them at different speeds, or replay from the beginning.`,
      code: `# Kafka concepts
# Topic:     named stream of records (like a database table)
# Partition: ordered, immutable log. Each topic has 1+ partitions for parallelism
# Offset:    position in a partition. Consumers commit their offset after processing.
# Consumer group: multiple consumers sharing the same group ID split partitions
#                 between them. Each partition is read by exactly ONE consumer in the group.

from confluent_kafka import Producer, Consumer, KafkaError
import json

# Producer
producer = Producer({"bootstrap.servers": "kafka:9092"})

def send_event(topic: str, key: str, event: dict):
    producer.produce(
        topic=topic,
        key=key,           # same key → same partition → ordered delivery for that key
        value=json.dumps(event).encode(),
        callback=lambda err, msg: print(f"Delivered to {msg.partition()}:{msg.offset()}") if not err else print(err)
    )
    producer.flush()

send_event("order.created", key="user:42",
           event={"order_id": 101, "user_id": 42, "amount": 99.99})

# Consumer (within a group — partitions are split across consumers)
consumer = Consumer({
    "bootstrap.servers": "kafka:9092",
    "group.id": "order-processor",          # consumer group
    "auto.offset.reset": "earliest",        # start from oldest unprocessed message
    "enable.auto.commit": False,            # manual offset commit for reliability
})
consumer.subscribe(["order.created"])

while True:
    msg = consumer.poll(timeout=1.0)
    if msg and not msg.error():
        event = json.loads(msg.value())
        process_order(event)
        consumer.commit()   # only commit after successful processing`,
    },
    {
      heading: "Queue vs Pub/Sub vs Streaming",
      body: `Different message systems suit different patterns. Choosing the wrong one creates architectural problems later.`,
      items: [
        "**Queue (SQS, RabbitMQ)**: message consumed by ONE consumer and deleted. Ideal for distributing work across a worker pool (e.g., sending emails, processing images).",
        "**Pub/Sub (SNS, Redis Pub/Sub)**: message delivered to ALL subscribers simultaneously. Ideal for fan-out notifications. Messages not persisted — subscribers must be online.",
        "**Streaming log (Kafka, Kinesis)**: messages retained on disk for a configurable period. Multiple consumer groups read independently. Ideal for event sourcing, audit logs, stream processing, replay.",
        "**Choosing**: use a queue for task distribution, pub/sub for notifications, Kafka when you need replay, multiple independent consumers, or high-throughput event streaming.",
        "**Celery + Redis**: a simple task queue for Python. Easy to set up, good for background jobs. Not suitable for high-throughput streaming or when replay is needed.",
      ],
    },
  ],
};
