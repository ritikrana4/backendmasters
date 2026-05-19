import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/connection-pooling";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Connection Pooling & Performance",
  description:
    "Learn database connection pooling with PgBouncer, configure application-level pools in SQLAlchemy and Node.js, analyze slow queries with pg_stat_statements, and understand VACUUM.",
  keywords: ["connection pooling", "pgbouncer", "postgresql performance", "slow query analysis", "pg_stat_statements"],
};

export default function ConnectionPoolingPage() {
  const topic = getTopic("sql", "connection-pooling");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
