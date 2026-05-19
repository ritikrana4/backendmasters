import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/dsa/arrays";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Arrays & Two-Pointer Technique",
  description: "Array fundamentals, two-pointer technique, sliding window pattern, and common interview problems solved in O(n) time instead of O(n²).",
  keywords: ["arrays", "two pointer", "sliding window", "dsa", "algorithms", "data structures", "technical interview"],
};

export default function ArraysPage() {
  const topic = getTopic("dsa", "arrays");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f97316" />;
}
