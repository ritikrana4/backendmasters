import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/system-design/database-scaling";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Database Scaling Patterns",
  description: "Read replicas, write sharding, federation, and denormalisation. How to scale PostgreSQL and when to move to NoSQL. CQRS, OLTP vs OLAP, and practical database architecture patterns.",
  keywords: ["database scaling", "read replicas", "database sharding", "federation", "cqrs", "system design database"],
};

export default function DatabaseScalingPage() {
  const topic = getTopic("system-design", "database-scaling");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f0883e" />;
}
