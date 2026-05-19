import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/system-design/load-balancing";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Load Balancing at Scale",
  description: "L4 vs L7 load balancing, routing algorithms (round-robin, least-connections, weighted), health checks, failover, and sticky sessions in distributed systems.",
  keywords: ["load balancing", "l4 vs l7", "round robin", "least connections", "sticky sessions", "system design"],
};

export default function LoadBalancingPage() {
  const topic = getTopic("system-design", "load-balancing");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f0883e" />;
}
