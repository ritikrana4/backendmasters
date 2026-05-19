import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/ai/ai-agents";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "AI Agents & Tool Use",
  description:
    "Learn AI agents: tool use, function calling, the agent loop, designing good tools, multi-step reasoning, and safety guardrails for agents with real-world access.",
  keywords: ["AI agents", "tool use", "function calling", "LLM agent", "agent loop", "AI automation"],
};

export default function AiAgentsPage() {
  const topic = getTopic("ai", "ai-agents");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#22d3ee"
    />
  );
}
