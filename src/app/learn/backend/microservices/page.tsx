import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/microservices";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Microservices Architecture",
  description: "Learn how to design microservices: bounded contexts, inter-service communication, data isolation, the strangler fig migration pattern, and when microservices are the wrong choice.",
  keywords: ["microservices architecture", "bounded context", "service mesh", "inter-service communication", "strangler fig pattern", "distributed systems"],
};

export default function MicroservicesPage() {
  const topic = getTopic("backend", "microservices");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#a371f7" />;
}
