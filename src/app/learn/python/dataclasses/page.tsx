import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/dataclasses";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Dataclasses — Python",
  description:
    "Use Python's @dataclass decorator to auto-generate __init__, __repr__, and __eq__. Covers field(), frozen, order, and __post_init__.",
  keywords: ["python dataclass", "python @dataclass", "python data classes", "python field", "python tutorial"],
};

export default function DataclassesPage() {
  const topic = getTopic("python", "dataclasses");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
