import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/ai/rag";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "RAG — Retrieval-Augmented Generation",
  description:
    "Learn RAG end-to-end: indexing pipeline, retrieval strategies, generation with injected context, chunking, reranking, hybrid search, and handling RAG failure modes.",
  keywords: ["RAG", "retrieval augmented generation", "vector search", "LLM context", "document Q&A"],
};

export default function RagPage() {
  const topic = getTopic("ai", "rag");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#22d3ee"
    />
  );
}
