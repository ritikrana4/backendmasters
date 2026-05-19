import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/query-planning";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Query Planning & EXPLAIN",
  description: "Learn to read PostgreSQL query plans with EXPLAIN ANALYZE. Understand seq scans vs index scans, hash joins vs nested loops, cost estimation, and how to diagnose and fix slow queries.",
  keywords: ["postgresql explain analyze", "query planning", "seq scan", "index scan", "query optimization", "pg_stat_statements"],
};

export default function QueryPlanningPage() {
  const topic = getTopic("sql", "query-planning");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
