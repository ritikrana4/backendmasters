import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/ai/calling-llm-apis";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Calling LLM APIs",
  description:
    "Learn how to call LLM APIs: Anthropic SDK, multi-turn conversations, error handling, async calls, structured JSON output, and reliable LLM integration patterns.",
  keywords: ["Anthropic SDK", "OpenAI API", "LLM API", "chat completions", "async LLM", "structured output"],
};

export default function CallingLlmApisPage() {
  const topic = getTopic("ai", "calling-llm-apis");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#22d3ee"
    />
  );
}
