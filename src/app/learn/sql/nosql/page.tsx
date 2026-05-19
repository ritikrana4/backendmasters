import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/nosql";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "NoSQL Databases",
  description:
    "Understand the NoSQL landscape: document stores (MongoDB), key-value stores (Redis), column-family databases (Cassandra), and graph databases. Learn when to use SQL vs NoSQL.",
  keywords: ["nosql databases", "mongodb vs postgresql", "redis database", "cassandra", "sql vs nosql", "cap theorem"],
};

export default function NoSqlPage() {
  const topic = getTopic("sql", "nosql");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
