import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/ai/ai-orchestration";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "AI Orchestration",
  description:
    "Learn AI orchestration: chaining LLM calls, parallel execution, router patterns, LangChain vs direct SDK, and state management in multi-step AI pipelines.",
  keywords: ["AI orchestration", "LLM chains", "LangChain", "LlamaIndex", "multi-step AI", "AI pipeline"],
};

export default function AiOrchestrationPage() {
  const topic = getTopic("ai", "ai-orchestration");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#22d3ee"
    />
  );
}
