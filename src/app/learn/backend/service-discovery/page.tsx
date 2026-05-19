import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/service-discovery";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Service Discovery & Load Balancing",
  description: "How services find each other in dynamic container environments. Client-side vs server-side discovery, Consul, Kubernetes DNS, health checks, and load-balancing algorithms.",
  keywords: ["service discovery", "consul", "kubernetes service", "load balancing algorithms", "health checks", "microservices networking"],
};

export default function ServiceDiscoveryPage() {
  const topic = getTopic("backend", "service-discovery");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#a371f7" />;
}
