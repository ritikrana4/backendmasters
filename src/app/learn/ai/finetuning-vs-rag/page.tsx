import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/ai/finetuning-vs-rag";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Fine-tuning vs RAG",
  description:
    "Understand when to use fine-tuning vs RAG: trade-offs, decision framework, fine-tuning in practice with OpenAI, and combining both for production AI systems.",
  keywords: ["fine-tuning", "RAG", "fine-tuning vs RAG", "LLM fine-tuning", "OpenAI fine-tuning"],
};

export default function FinetuningVsRagPage() {
  const topic = getTopic("ai", "finetuning-vs-rag");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#22d3ee"
    />
  );
}
