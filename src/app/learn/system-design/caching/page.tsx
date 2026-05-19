import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/system-design/caching";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Caching Strategies",
  description: "Cache-aside, write-through, and write-behind patterns. Cache eviction (LRU, LFU, TTL), the thundering herd problem, and when caching introduces more problems than it solves.",
  keywords: ["caching strategies", "cache aside", "write through", "redis caching", "lru eviction", "thundering herd"],
};

export default function CachingPage() {
  const topic = getTopic("system-design", "caching");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f0883e" />;
}
