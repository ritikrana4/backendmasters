import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/ai/production-ai";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Production AI",
  description:
    "Learn production AI engineering: caching LLM responses, rate limiting, cost tracking, observability, provider fallbacks, and a production readiness checklist.",
  keywords: ["production AI", "LLM caching", "AI cost optimization", "LLM observability", "AI reliability"],
};

export default function ProductionAiPage() {
  const topic = getTopic("ai", "production-ai");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#22d3ee"
    />
  );
}
