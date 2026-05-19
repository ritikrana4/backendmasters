import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/decorators";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Decorators — Python",
  description:
    "Learn Python decorators: wrap functions with @decorator syntax, use functools.wraps, and build practical timing, retry, and memoization decorators.",
  keywords: ["python decorators", "python @decorator", "functools wraps", "python higher order functions", "python tutorial"],
};

export default function DecoratorsPage() {
  const topic = getTopic("python", "decorators");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
