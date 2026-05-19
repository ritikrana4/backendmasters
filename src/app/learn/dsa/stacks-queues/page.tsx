import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/dsa/stacks-queues";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Stacks & Queues",
  description: "LIFO stacks and FIFO queues, the monotonic stack technique for next-greater-element problems, and breadth-first search implemented with a queue.",
  keywords: ["stack", "queue", "lifo", "fifo", "monotonic stack", "bfs", "dsa", "data structures"],
};

export default function StacksQueuesPage() {
  const topic = getTopic("dsa", "stacks-queues");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f97316" />;
}
