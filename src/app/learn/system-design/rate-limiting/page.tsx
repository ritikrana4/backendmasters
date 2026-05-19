import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/system-design/rate-limiting";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Distributed Rate Limiting",
  description: "Token bucket, leaky bucket, and sliding window rate limiting algorithms. Distributed rate limiting with Redis across multiple API gateway nodes, and per-IP vs per-user strategies.",
  keywords: ["rate limiting", "token bucket", "sliding window", "distributed rate limiting", "redis rate limit", "api gateway"],
};

export default function RateLimitingPage() {
  const topic = getTopic("system-design", "rate-limiting");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f0883e" />;
}
