export const content = {
  title: "SQS, SNS & Messaging",
  sections: [
    {
      heading: "SQS — Simple Queue Service",
      body: "**Amazon SQS** is a managed message queue. Producers send messages to a queue; consumers poll the queue, process messages, and delete them. SQS decouples services: the producer doesn't wait for the consumer, and the consumer can be down without the producer noticing.\n\nSQS is **pull-based**: consumers call `ReceiveMessage` to fetch up to 10 messages per call. After receiving a message, it becomes invisible to other consumers for the **visibility timeout** (default 30 seconds). If the consumer processes successfully, it deletes the message. If not (crash or error), the message becomes visible again and another consumer can pick it up.",
      items: [
        "`Standard queue` — at-least-once delivery, best-effort ordering, nearly unlimited throughput. A message may occasionally be delivered more than once — design consumers to be idempotent.",
        "`FIFO queue` — exactly-once processing, strict ordering within a message group. Throughput capped at 3,000 messages/second (with batching).",
        "`Visibility timeout` — how long a message is hidden after being received. Set it to 6× your average processing time.",
        "`Message retention` — default 4 days, max 14 days.",
        "`Long polling` — `ReceiveMessage` waits up to 20 seconds for messages instead of returning empty. Reduces cost and CPU on consumers.",
      ],
    },
    {
      heading: "Dead-Letter Queues",
      body: "A **Dead-Letter Queue (DLQ)** is a separate SQS queue that receives messages that couldn't be processed after N retries (the `maxReceiveCount`). Instead of being silently dropped, failed messages accumulate in the DLQ where you can inspect them, replay them, or alert on them.\n\nAlways configure a DLQ for production queues. Set a CloudWatch alarm on the DLQ's `ApproximateNumberOfMessagesVisible` metric to get paged when messages land in the DLQ.",
      code: `import boto3
import json

sqs = boto3.client("sqs")

# Send a message
sqs.send_message(
    QueueUrl="https://sqs.us-east-1.amazonaws.com/123456789/orders",
    MessageBody=json.dumps({
        "order_id": "ord-42",
        "user_id": "u-99",
        "total": 49.99,
    }),
    MessageGroupId="user-u-99",     # FIFO only
    MessageDeduplicationId="ord-42", # FIFO only
)

# Receive and process
response = sqs.receive_message(
    QueueUrl="https://sqs.us-east-1.amazonaws.com/123456789/orders",
    MaxNumberOfMessages=10,
    WaitTimeSeconds=20,  # long polling
    VisibilityTimeout=60,
)
for msg in response.get("Messages", []):
    process(json.loads(msg["Body"]))
    sqs.delete_message(
        QueueUrl="...",
        ReceiptHandle=msg["ReceiptHandle"],
    )`,
    },
    {
      heading: "SNS — Simple Notification Service",
      body: "**Amazon SNS** is a managed pub/sub service. A **publisher** sends a message to a **topic**; SNS delivers it to all **subscriptions** simultaneously. Subscribers can be SQS queues, Lambda functions, HTTPS endpoints, email addresses, or SMS numbers.\n\nSNS is **push-based**: it actively delivers to subscribers rather than waiting to be polled. Delivery to SQS is reliable (retried); delivery to HTTPS endpoints retries 3 times then drops (use a SQS subscriber for durability).",
      items: [
        "`Topic` — the pub/sub channel. ARN format: `arn:aws:sns:us-east-1:123456789012:order-events`.",
        "`Subscription` — a subscriber to a topic. Each subscription has a protocol (SQS, Lambda, HTTPS, email, SMS).",
        "`Message filtering` — subscribers can set filter policies so they only receive messages with matching attributes.",
        "`FIFO topic` — SNS FIFO + SQS FIFO together for ordered, exactly-once fan-out.",
        "`SNS → Lambda` — SNS pushes asynchronously to Lambda. Lambda retries up to 3 times; undelivered messages go to a DLQ.",
      ],
    },
    {
      heading: "Fan-Out Pattern",
      body: "The **fan-out pattern** uses SNS to broadcast a single event to multiple SQS queues, each consumed by a different service. This decouples producers from consumers: the producer publishes once to SNS, and any number of independent services react.\n\nExample: an `order-placed` event is published to SNS. Three SQS queues subscribe: one for the inventory service, one for the email notification service, one for the analytics service. Each processes at its own pace — the inventory service doesn't need to know about the email service.",
      code: `# Fan-out architecture
#
#              ┌── SQS: inventory-queue  → Inventory Service
# SNS: orders ─┼── SQS: email-queue     → Email Service
#              └── SQS: analytics-queue → Analytics Service
#
# Terraform resource sketch:
resource "aws_sns_topic" "orders" {
  name = "order-events"
}
resource "aws_sqs_queue" "inventory" {
  name = "inventory-queue"
}
resource "aws_sns_topic_subscription" "to_inventory" {
  topic_arn = aws_sns_topic.orders.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.inventory.arn
  filter_policy = jsonencode({
    event_type = ["order_placed", "order_cancelled"]
  })
}`,
      items: [
        "Give each SQS queue its own DLQ — a fan-out failure in one subscriber shouldn't affect others.",
        "Set the SQS `VisibilityTimeout` to be at least 6× the Lambda timeout (if Lambda consumes the queue).",
        "`EventBridge` — a more powerful event bus than SNS+SQS for complex routing rules, schema registry, and cross-account event delivery.",
      ],
    },
  ],
};
