import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/insert-update-delete";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "INSERT, UPDATE & DELETE",
  description:
    "Learn how to modify data in SQL: inserting single and multiple rows, upsert with ON CONFLICT, safe UPDATE and DELETE patterns, TRUNCATE, and soft deletes.",
  keywords: ["sql insert", "sql update", "sql delete", "sql upsert", "on conflict", "soft delete"],
};

export default function InsertUpdateDeletePage() {
  const topic = getTopic("sql", "insert-update-delete");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
