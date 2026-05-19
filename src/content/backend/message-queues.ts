export const content = {
  title: "Message Queues & Event Streaming",
  sections: [
    {
      heading: "Why Async Communication?",
      body: `In a synchronous system, Service A calls Service B and waits for a response. If B is slow or down, A is blocked. **Message queues** decouple services: A drops a message and moves on. B picks it up when it's ready. This improves resilience, throughput, and lets services scale independently.`,
      items: [
        "**Decoupling** — producer doesn't know about consumers; adding a new consumer doesn't change the producer",
        "**Buffering** — absorbs traffic spikes: queue messages during a spike, process them at a steady rate",
        "**Resilience** — if a consumer crashes, messages aren't lost — they stay in the queue until processed",
        "**Async workflows** — send email, resize image, charge payment asynchronously without blocking the user response",
        "**Fan-out** — one event triggers many independent processes (send email AND update analytics AND notify Slack)",
      ],
    },
    {
      heading: "RabbitMQ — Message Broker",
      body: `**RabbitMQ** is a traditional message broker. Producers publish messages to **exchanges**; exchanges route them to **queues** based on rules; consumers subscribe to queues. Excellent for task queues and complex routing.`,
      code: `# RabbitMQ concepts:
# Producer → Exchange → Queue → Consumer
#
# Exchange types:
# direct  → routes by exact routing key  (task queues)
# topic   → routes by pattern (logs.error.*, orders.#)
# fanout  → broadcasts to ALL bound queues
# headers → routes by message headers

# Python with pika (RabbitMQ client)
import pika, json

# Producer: publish a task
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

channel.queue_declare(queue='email_jobs', durable=True)  # durable: survives restart

channel.basic_publish(
    exchange='',
    routing_key='email_jobs',
    body=json.dumps({"to": "alice@example.com", "subject": "Welcome"}),
    properties=pika.BasicProperties(delivery_mode=2)  # persistent message
)

# Consumer: process tasks
def handle_email(ch, method, properties, body):
    task = json.loads(body)
    send_email(task["to"], task["subject"])
    ch.basic_ack(delivery_tag=method.delivery_tag)  # acknowledge: remove from queue

channel.basic_qos(prefetch_count=1)  # one task at a time
channel.basic_consume(queue='email_jobs', on_message_callback=handle_email)
channel.start_consuming()`,
    },
    {
      heading: "Kafka — Event Streaming",
      body: `**Apache Kafka** is a distributed event streaming platform. Unlike RabbitMQ (messages are deleted after consumption), Kafka retains events in an append-only log. Consumers can replay history, multiple independent consumer groups each get all messages.`,
      code: `# Kafka concepts:
# - Topic: a named stream of events (like a database table)
# - Partition: topic is split into partitions for parallelism
# - Offset: position of a message in a partition (Kafka retains messages)
# - Consumer group: multiple instances share the work of consuming a topic
#   (each partition is assigned to one consumer in the group)
# - Replication: each partition is replicated across brokers for durability

# Producer
from confluent_kafka import Producer

p = Producer({'bootstrap.servers': 'localhost:9092'})

p.produce(
    topic='order.created',
    key='order-123',           # key determines which partition
    value=json.dumps({
        "order_id": 123,
        "user_id": 42,
        "total": 150.00
    })
)
p.flush()  # wait for delivery

# Consumer
from confluent_kafka import Consumer

c = Consumer({
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'email-service',   # consumer group — independent from other groups
    'auto.offset.reset': 'earliest'
})
c.subscribe(['order.created'])

while True:
    msg = c.poll(1.0)
    if msg is None: continue
    order = json.loads(msg.value())
    send_order_confirmation(order)
    c.commit()  # mark this offset as processed`,
    },
    {
      heading: "RabbitMQ vs Kafka",
      body: `They solve different problems. Choosing the wrong one is a common architectural mistake.`,
      items: [
        "**RabbitMQ** — message broker. Best for task queues, work distribution, and RPC-style async calls. Messages deleted after consumption. Low message volume (thousands/sec).",
        "**Kafka** — event log. Best for event sourcing, audit trails, data pipelines, and fan-out to many independent consumers. Messages retained (days or forever). High throughput (millions/sec).",
        "**Use RabbitMQ when**: you want to distribute work across N workers (each task processed by exactly one worker), need flexible routing, or have low-to-medium volume",
        "**Use Kafka when**: multiple independent services need to react to the same events, you need message replay/reprocessing, or you're building a real-time data pipeline",
        "**Dead Letter Queue (DLQ)**: messages that fail after N retries are moved to a DLQ for inspection. Essential for both systems — never silently drop failed messages.",
      ],
    },
    {
      heading: "Delivery Guarantees",
      body: `Distributed messaging systems can't guarantee exactly-once delivery without coordination overhead. Understanding the trade-offs is critical for building correct systems.`,
      items: [
        "**At-most-once** — fire and forget. Messages may be lost, never duplicated. Fast, but unsuitable for anything important.",
        "**At-least-once** — messages are delivered, but may be duplicated (on retry after crash). Requires consumers to be **idempotent** — processing the same message twice should be safe.",
        "**Exactly-once** — each message processed exactly once. Requires coordination (distributed transactions). Kafka supports this within a cluster but it's complex and expensive.",
        "**Idempotent consumers**: use a deduplication key (message ID) and check-then-act: if already processed, skip. Store processed IDs in Redis or DB with TTL.",
        "The practical approach: use at-least-once delivery + idempotent consumers. This gives effectively-once semantics without the overhead of true exactly-once.",
      ],
    },
  ],
};
