import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/system-design/scalability";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Scalability Fundamentals",
  description: "Vertical vs horizontal scaling, stateless services, shared-nothing architecture, and auto-scaling. The foundational concepts behind systems that handle millions of requests.",
  keywords: ["scalability", "horizontal scaling", "vertical scaling", "stateless architecture", "auto-scaling", "system design"],
};

export default function ScalabilityPage() {
  const topic = getTopic("system-design", "scalability");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f0883e" />;
}
