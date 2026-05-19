import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/partitioning";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Partitioning & Sharding",
  description: "Scale large PostgreSQL tables with range, hash, and list partitioning. Learn partition pruning, dropping old data, and when to shard across multiple database instances.",
  keywords: ["postgresql partitioning", "table partitioning", "database sharding", "range partitioning", "hash partitioning", "shard key"],
};

export default function PartitioningPage() {
  const topic = getTopic("sql", "partitioning");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
