import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/ai/evaluating-llm-apps";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Evaluating LLM Applications",
  description:
    "Learn how to evaluate LLM apps: building eval datasets, LLM-as-judge, regression testing, RAGAS metrics for RAG, and systematic quality measurement in production.",
  keywords: ["LLM evaluation", "RAGAS", "LLM judge", "AI evaluation", "RAG metrics", "prompt testing"],
};

export default function EvaluatingLlmAppsPage() {
  const topic = getTopic("ai", "evaluating-llm-apps");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#22d3ee"
    />
  );
}
