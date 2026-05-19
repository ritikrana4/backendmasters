import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/subqueries-and-ctes";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Subqueries & CTEs",
  description:
    "Learn SQL subqueries in WHERE, FROM, and SELECT clauses, EXISTS and NOT EXISTS patterns, Common Table Expressions (WITH), and recursive CTEs for hierarchical data.",
  keywords: ["sql subquery", "sql cte", "common table expression", "sql exists", "recursive cte", "sql with clause"],
};

export default function SubqueriesAndCtesPage() {
  const topic = getTopic("sql", "subqueries-and-ctes");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
