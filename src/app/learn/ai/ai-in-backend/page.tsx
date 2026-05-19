import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/ai/ai-in-backend";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "AI in Backend Systems",
  description:
    "Learn how AI integrates into backend systems: LLM API calls, cost and latency trade-offs, common use cases, and patterns for shipping AI features to production.",
  keywords: ["AI backend", "LLM integration", "AI engineering", "production AI", "AI API"],
};

export default function AiInBackendPage() {
  const topic = getTopic("ai", "ai-in-backend");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#22d3ee"
    />
  );
}
