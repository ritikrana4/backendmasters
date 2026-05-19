import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/select-basics";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "SELECT — Querying Data",
  description:
    "Master the SQL SELECT statement: filtering with WHERE, sorting with ORDER BY, pagination with LIMIT/OFFSET, NULL handling, LIKE pattern matching, and DISTINCT.",
  keywords: ["sql select", "sql where clause", "sql order by", "sql limit", "sql null handling"],
};

export default function SelectBasicsPage() {
  const topic = getTopic("sql", "select-basics");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
