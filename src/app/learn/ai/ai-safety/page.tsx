import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/ai/ai-safety";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "AI Safety & Guardrails",
  description:
    "Learn AI safety for production: input validation, output guardrails, prompt injection defence, system prompt protection, agent safety, and responsible AI deployment.",
  keywords: ["AI safety", "AI guardrails", "prompt injection", "LLM safety", "AI security", "responsible AI"],
};

export default function AiSafetyPage() {
  const topic = getTopic("ai", "ai-safety");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#22d3ee"
    />
  );
}
