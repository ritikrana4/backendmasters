import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/logging-observability";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Logging & Observability",
  description:
    "Learn logging and observability for production backend systems: structured logging, distributed tracing, metrics, alerts, and the three pillars — logs, traces, and metrics.",
  keywords: ["logging", "observability", "distributed tracing", "metrics", "OpenTelemetry", "structured logging"],
};

export default function LoggingObservabilityPage() {
  const topic = getTopic("backend", "logging-observability");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#a371f7"
    />
  );
}
