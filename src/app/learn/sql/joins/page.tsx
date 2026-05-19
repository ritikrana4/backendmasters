import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/joins";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "SQL Joins",
  description:
    "Master all SQL join types: INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, SELF JOIN, and CROSS JOIN. Learn the anti-join pattern and how to join multiple tables.",
  keywords: ["sql joins", "inner join", "left join", "outer join", "sql join types", "join multiple tables"],
};

export default function JoinsPage() {
  const topic = getTopic("sql", "joins");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
