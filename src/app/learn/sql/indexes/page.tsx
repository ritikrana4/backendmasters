import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/indexes";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Indexes & Query Optimization",
  description:
    "Learn how database indexes work, when to add them, how to read EXPLAIN ANALYZE output, avoid the N+1 problem, and optimize slow SQL queries in production.",
  keywords: ["sql indexes", "query optimization", "explain analyze", "n+1 problem", "database index", "btree index"],
};

export default function IndexesPage() {
  const topic = getTopic("sql", "indexes");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
