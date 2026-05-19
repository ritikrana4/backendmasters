import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/relationships";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Relationships & Junction Tables",
  description:
    "Model one-to-one, one-to-many, many-to-many, self-referential, and polymorphic relationships in SQL using foreign keys and junction tables.",
  keywords: ["sql relationships", "many to many sql", "junction table", "foreign key relationship", "self join sql"],
};

export default function RelationshipsPage() {
  const topic = getTopic("sql", "relationships");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
