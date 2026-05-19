import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/ai/streaming-responses";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Streaming AI Responses",
  description:
    "Learn how to stream LLM responses: Anthropic streaming SDK, Server-Sent Events, FastAPI StreamingResponse, client-side SSE consumption, and handling streaming failures.",
  keywords: ["streaming LLM", "Server-Sent Events", "SSE", "FastAPI streaming", "AI streaming", "token streaming"],
};

export default function StreamingResponsesPage() {
  const topic = getTopic("ai", "streaming-responses");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#22d3ee"
    />
  );
}
