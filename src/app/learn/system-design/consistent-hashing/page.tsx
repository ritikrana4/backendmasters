import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/system-design/consistent-hashing";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Consistent Hashing",
  description: "How consistent hashing minimises data movement when adding or removing nodes. Hash rings, virtual nodes, and consistent hashing in Cassandra, DynamoDB, and Redis Cluster.",
  keywords: ["consistent hashing", "hash ring", "virtual nodes", "cassandra", "distributed cache", "system design"],
};

export default function ConsistentHashingPage() {
  const topic = getTopic("system-design", "consistent-hashing");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f0883e" />;
}
