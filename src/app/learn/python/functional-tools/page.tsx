import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/functional-tools";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Functional Tools — Python",
  description:
    "Master Python's functional toolkit: map, filter, zip, enumerate, sorted with key, and functools.reduce for expressive data transformations.",
  keywords: ["python map filter", "python enumerate", "python zip", "python sorted key", "python functional programming"],
};

export default function FunctionalToolsPage() {
  const topic = getTopic("python", "functional-tools");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
