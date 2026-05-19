import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/dsa/trees";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Binary Trees & DFS/BFS",
  description: "Tree node structure, depth-first search (inorder/preorder/postorder), breadth-first level-order traversal, tree height, and the Binary Search Tree property.",
  keywords: ["binary tree", "dfs", "bfs", "tree traversal", "inorder", "preorder", "bst", "dsa"],
};

export default function TreesPage() {
  const topic = getTopic("dsa", "trees");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f97316" />;
}
