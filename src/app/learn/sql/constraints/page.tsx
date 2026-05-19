import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/constraints";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Constraints & Keys",
  description:
    "Learn SQL constraints: PRIMARY KEY, FOREIGN KEY with CASCADE/RESTRICT/SET NULL, UNIQUE, NOT NULL, CHECK, DEFAULT, and deferrable constraints for data integrity.",
  keywords: ["sql constraints", "primary key", "foreign key cascade", "sql unique", "check constraint", "data integrity"],
};

export default function ConstraintsPage() {
  const topic = getTopic("sql", "constraints");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
