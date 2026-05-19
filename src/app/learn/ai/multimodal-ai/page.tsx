import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/ai/multimodal-ai";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Multimodal AI",
  description:
    "Learn multimodal AI: sending images and PDFs to LLMs, document understanding, multiple images in one request, production use cases, and image sizing for cost control.",
  keywords: ["multimodal AI", "vision LLM", "Claude vision", "PDF extraction", "image AI", "document AI"],
};

export default function MultimodalAiPage() {
  const topic = getTopic("ai", "multimodal-ai");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#22d3ee"
    />
  );
}
