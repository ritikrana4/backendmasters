import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/ai/vector-databases";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Vector Databases",
  description:
    "Learn vector databases: ANN search algorithms, HNSW, pgvector, Pinecone, Qdrant, metadata filtering, and how to choose the right vector store for your AI system.",
  keywords: ["vector database", "pgvector", "Pinecone", "HNSW", "ANN search", "Qdrant", "Weaviate"],
};

export default function VectorDatabasesPage() {
  const topic = getTopic("ai", "vector-databases");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#22d3ee"
    />
  );
}
