import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/backend-architecture";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Backend Architecture Overview",
  description: "Understand how backend systems are structured: servers, databases, caches, queues, monoliths vs microservices, three-tier architecture, and stateless design.",
  keywords: ["backend architecture", "three tier architecture", "monolith vs microservices", "stateless server", "backend overview"],
};

export default function BackendArchitecturePage() {
  const topic = getTopic("backend", "backend-architecture");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#a371f7" />;
}
