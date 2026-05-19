import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/iterators-and-generators";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Iterators & Generators — Python",
  description:
    "Understand Python's iteration protocol, write memory-efficient generators with yield, use generator expressions, and explore itertools.",
  keywords: ["python generators", "python yield", "python iterator", "python itertools", "python lazy evaluation"],
};

export default function IteratorsAndGeneratorsPage() {
  const topic = getTopic("python", "iterators-and-generators");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
