import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/relational-fundamentals";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Relational Database Fundamentals",
  description:
    "Learn what relational databases are, how tables, rows, and columns work, the role of primary and foreign keys, and why PostgreSQL is the default choice for production backends.",
  keywords: ["relational database", "sql basics", "primary key", "foreign key", "postgresql intro"],
};

export default function RelationalFundamentalsPage() {
  const topic = getTopic("sql", "relational-fundamentals");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
