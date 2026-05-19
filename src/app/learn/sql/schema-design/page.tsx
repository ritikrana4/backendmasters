import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/schema-design";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Schema Design & Normalization",
  description:
    "Learn database normalization: 1NF, 2NF, 3NF, and BCNF. Understand update, insert, and delete anomalies, when to denormalize, and how to use materialized views.",
  keywords: ["database normalization", "1nf 2nf 3nf", "schema design", "database denormalization", "materialized view"],
};

export default function SchemaDesignPage() {
  const topic = getTopic("sql", "schema-design");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
