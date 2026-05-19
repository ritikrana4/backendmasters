import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/system-design/message-queues";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Message Queue Architecture",
  description: "Producer-consumer patterns, at-least-once vs exactly-once delivery, consumer groups, dead-letter queues, and Kafka's partitioned log architecture for high-throughput streaming.",
  keywords: ["message queue", "kafka architecture", "producer consumer", "at least once delivery", "dead letter queue", "event streaming"],
};

export default function MessageQueuesPage() {
  const topic = getTopic("system-design", "message-queues");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f0883e" />;
}
