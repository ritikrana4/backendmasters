import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/variables";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Variables & Data Types — Python",
  description:
    "Learn how Python variables work and explore the core data types: strings, integers, floats, and booleans. Includes interactive code exercises.",
  keywords: ["python variables", "python data types", "learn python", "python tutorial"],
};

export default function VariablesPage() {
  const topic = getTopic("python", "variables");
  if (!topic) notFound();

  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
