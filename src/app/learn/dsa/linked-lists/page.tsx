import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/dsa/linked-lists";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Linked Lists",
  description: "Singly linked lists, node structure, traversal, insertion/deletion, and the fast-slow pointer technique for cycle detection and finding the middle node.",
  keywords: ["linked list", "nodes", "pointers", "fast slow pointer", "cycle detection", "dsa", "data structures"],
};

export default function LinkedListsPage() {
  const topic = getTopic("dsa", "linked-lists");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f97316" />;
}
