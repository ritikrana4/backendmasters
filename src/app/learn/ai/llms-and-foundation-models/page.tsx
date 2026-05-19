import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/ai/llms-and-foundation-models";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "LLMs & Foundation Models",
  description:
    "Understand large language models: tokens, context windows, transformer architecture, closed vs open-weight models, instruction tuning, and multimodal capabilities.",
  keywords: ["LLM", "large language model", "foundation model", "transformer", "tokens", "GPT", "Claude"],
};

export default function LlmsPage() {
  const topic = getTopic("ai", "llms-and-foundation-models");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#22d3ee"
    />
  );
}
