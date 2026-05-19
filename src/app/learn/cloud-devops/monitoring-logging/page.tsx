import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/cloud-devops/monitoring-logging";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Monitoring & Observability",
  description: "The three pillars of observability: metrics with Prometheus & Grafana, structured logging pipelines, and distributed tracing with OpenTelemetry.",
  keywords: ["monitoring", "observability", "prometheus", "grafana", "logging", "distributed tracing", "opentelemetry"],
};

export default function MonitoringLoggingPage() {
  const topic = getTopic("cloud-devops", "monitoring-logging");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#0ea5e9" />;
}
