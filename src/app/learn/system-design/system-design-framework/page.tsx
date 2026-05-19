import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/system-design/system-design-framework";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "System Design Interview Framework",
  description: "A repeatable framework for system design interviews: requirements, capacity estimation, high-level design, API design, data model, and trade-off discussion. With common deep-dive questions.",
  keywords: ["system design interview", "reshaded framework", "capacity estimation", "system design framework", "technical interview", "backend interview"],
};

export default function SystemDesignFrameworkPage() {
  const topic = getTopic("system-design", "system-design-framework");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f0883e" />;
}
