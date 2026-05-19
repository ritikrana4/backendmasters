import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/list-comprehensions";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "List Comprehensions — Python",
  description:
    "Write concise Python one-liners with list, dict, and set comprehensions. Filtering, transforming, and nesting — with interactive exercises.",
  keywords: ["python list comprehension", "dict comprehension", "set comprehension", "python one-liner", "python tutorial"],
};

export default function ListComprehensionsPage() {
  const topic = getTopic("python", "list-comprehensions");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
