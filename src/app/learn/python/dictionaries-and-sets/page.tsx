import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/dictionaries-and-sets";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Dictionaries & Sets — Python",
  description:
    "Learn Python dictionaries and sets: key-value pairs, dict methods, set operations (union, intersection, difference), and practical patterns.",
  keywords: ["python dictionary", "python dict", "python sets", "set operations", "python tutorial"],
};

export default function DictionariesAndSetsPage() {
  const topic = getTopic("python", "dictionaries-and-sets");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
