import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/aggregations";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Aggregations & GROUP BY",
  description:
    "Learn SQL aggregate functions (COUNT, SUM, AVG, MIN, MAX), GROUP BY, HAVING, COUNT DISTINCT, conditional aggregation, and time-series grouping.",
  keywords: ["sql group by", "sql aggregate functions", "sql count sum avg", "having clause", "sql aggregation"],
};

export default function AggregationsPage() {
  const topic = getTopic("sql", "aggregations");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
