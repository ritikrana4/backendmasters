import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/ai/embeddings";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Embeddings & Semantic Search",
  description:
    "Learn text embeddings and semantic search: generating embeddings, cosine similarity, building a search index, chunking strategies, and embedding use cases in backend systems.",
  keywords: ["text embeddings", "semantic search", "vector embeddings", "cosine similarity", "OpenAI embeddings"],
};

export default function EmbeddingsPage() {
  const topic = getTopic("ai", "embeddings");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#22d3ee"
    />
  );
}
