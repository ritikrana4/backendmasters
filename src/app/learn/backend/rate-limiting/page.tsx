import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/rate-limiting";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Rate Limiting & Throttling",
  description: "Protect your API with rate limiting: token bucket, sliding window, and fixed window algorithms. Per-user and global limits with Redis, and rate limit headers.",
  keywords: ["rate limiting api", "token bucket algorithm", "sliding window rate limit", "redis rate limiting", "api throttling"],
};

export default function RateLimitingPage() {
  const topic = getTopic("backend", "rate-limiting");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#a371f7" />;
}
