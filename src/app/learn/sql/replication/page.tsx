import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/replication";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Replication & Read Replicas",
  description: "Scale PostgreSQL read traffic with streaming replication. Learn primary/replica setup, replication lag, synchronous vs asynchronous replication, read replica routing, and failover with Patroni.",
  keywords: ["postgresql replication", "read replica", "streaming replication", "replication lag", "patroni", "database high availability"],
};

export default function ReplicationPage() {
  const topic = getTopic("sql", "replication");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
