import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/http/load-balancers";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Load Balancers & Reverse Proxies",
  description: "Learn how load balancers distribute traffic with Nginx and HAProxy. Covers round-robin, least-connections, and IP hash algorithms, health checks, SSL termination, and upstream failover.",
  keywords: ["load balancer", "reverse proxy", "nginx load balancing", "haproxy", "ssl termination", "upstream failover"],
};

export default function LoadBalancersPage() {
  const topic = getTopic("http", "load-balancers");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#58a6ff" />;
}
