import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/dsa/binary-search";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Binary Search",
  description: "How binary search achieves O(log n) by halving the search space. Iterative and recursive implementations, the off-by-one trap, and finding first/last occurrence.",
  keywords: ["binary search", "search algorithms", "sorted array", "o log n", "dsa", "algorithms"],
};

export default function BinarySearchPage() {
  const topic = getTopic("dsa", "binary-search");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f97316" />;
}
