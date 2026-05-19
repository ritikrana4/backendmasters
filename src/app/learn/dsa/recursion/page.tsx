import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/dsa/recursion";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Recursion — 5 Problems",
  description: "Build recursion intuition through 5 problems: factorial, Fibonacci, sum of digits, power function, and palindrome check — with animated call-tree diagrams for each.",
  keywords: ["recursion", "factorial", "fibonacci", "call stack", "base case", "dsa", "algorithms"],
};

export default function RecursionPage() {
  const topic = getTopic("dsa", "recursion");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f97316" />;
}
