import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/window-functions";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Window Functions",
  description:
    "Master SQL window functions: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, FIRST_VALUE, NTILE, and running totals with OVER, PARTITION BY, and frame clauses.",
  keywords: ["sql window functions", "row_number sql", "rank sql", "lag lead sql", "partition by sql", "over clause"],
};

export default function WindowFunctionsPage() {
  const topic = getTopic("sql", "window-functions");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
