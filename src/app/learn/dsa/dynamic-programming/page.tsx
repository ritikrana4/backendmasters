import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/dsa/dynamic-programming";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Dynamic Programming",
  description: "Overlapping subproblems and optimal substructure. Top-down memoization vs bottom-up tabulation, with Fibonacci and coin change as worked examples.",
  keywords: ["dynamic programming", "memoization", "tabulation", "fibonacci", "coin change", "dp", "dsa"],
};

export default function DynamicProgrammingPage() {
  const topic = getTopic("dsa", "dynamic-programming");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f97316" />;
}
