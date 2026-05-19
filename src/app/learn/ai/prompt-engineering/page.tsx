import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/ai/prompt-engineering";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Prompt Engineering",
  description:
    "Learn prompt engineering techniques: system prompts, few-shot examples, chain-of-thought, output formatting, prompt injection defence, and writing reliable LLM instructions.",
  keywords: ["prompt engineering", "few-shot prompting", "chain of thought", "system prompt", "LLM prompting"],
};

export default function PromptEngineeringPage() {
  const topic = getTopic("ai", "prompt-engineering");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#22d3ee"
    />
  );
}
