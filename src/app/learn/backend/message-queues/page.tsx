import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/message-queues";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Message Queues & Event Streaming",
  description: "Learn async communication with RabbitMQ and Kafka. Pub/sub, fan-out, consumer groups, dead-letter queues, and at-least-once delivery guarantees.",
  keywords: ["rabbitmq tutorial", "kafka tutorial", "message queue", "pub sub", "event streaming", "dead letter queue"],
};

export default function MessageQueuesPage() {
  const topic = getTopic("backend", "message-queues");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#a371f7" />;
}
