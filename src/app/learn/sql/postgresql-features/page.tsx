import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/postgresql-features";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "PostgreSQL Features",
  description:
    "Explore PostgreSQL's advanced features: JSONB storage and querying, arrays, built-in full-text search with tsvector/tsquery, UUID keys, UPSERT, and RETURNING.",
  keywords: ["postgresql jsonb", "postgresql full text search", "postgresql arrays", "postgresql upsert", "uuid postgresql"],
};

export default function PostgresqlFeaturesPage() {
  const topic = getTopic("sql", "postgresql-features");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
