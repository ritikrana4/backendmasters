import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/classes-and-objects";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Classes & Objects — Python",
  description:
    "Learn Python OOP: define classes with __init__, use self, write instance methods, add inheritance, dunder methods, and @property.",
  keywords: ["python classes", "python OOP", "python __init__", "python inheritance", "python tutorial"],
};

export default function ClassesAndObjectsPage() {
  const topic = getTopic("python", "classes-and-objects");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
