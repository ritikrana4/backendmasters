import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/caching";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Caching",
  description: "Learn caching strategies: cache-aside, write-through, write-behind. Redis TTLs, cache invalidation, stampede prevention, and what to cache vs what not to.",
  keywords: ["redis caching", "cache aside pattern", "cache invalidation", "cache stampede", "write through cache"],
};

export default function CachingPage() {
  const topic = getTopic("backend", "caching");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#a371f7" />;
}
