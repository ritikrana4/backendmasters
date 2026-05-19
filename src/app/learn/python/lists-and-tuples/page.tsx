import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/lists-and-tuples";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Lists & Tuples — Python",
  description:
    "Master Python lists and tuples: indexing, slicing, append, sort, pop, tuple immutability, and unpacking. Includes interactive exercises.",
  keywords: ["python lists", "python tuples", "python list methods", "list slicing", "python tutorial"],
};

export default function ListsAndTuplesPage() {
  const topic = getTopic("python", "lists-and-tuples");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
