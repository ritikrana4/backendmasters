import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/resilience";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Resilience & Fault Tolerance",
  description:
    "Learn how to build resilient backend systems: circuit breakers, retries with backoff, timeouts, bulkheads, graceful degradation, and chaos engineering principles.",
  keywords: ["resilience", "fault tolerance", "circuit breaker", "retry", "bulkhead", "chaos engineering"],
};

export default function ResiliencePage() {
  const topic = getTopic("backend", "resilience");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#a371f7"
    />
  );
}
