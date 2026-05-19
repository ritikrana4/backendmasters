import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/system-design/cap-theorem";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "CAP Theorem",
  description: "Consistency, availability, and partition tolerance in distributed systems. CP vs AP systems, the PACELC model, eventual consistency, and how real databases (Cassandra, DynamoDB, PostgreSQL) navigate the trade-off.",
  keywords: ["cap theorem", "consistency availability partition", "eventual consistency", "distributed systems", "pacelc", "cp vs ap"],
};

export default function CapTheoremPage() {
  const topic = getTopic("system-design", "cap-theorem");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f0883e" />;
}
