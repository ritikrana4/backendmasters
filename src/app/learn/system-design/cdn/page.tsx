import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/system-design/cdn";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "CDN & Edge Delivery",
  description: "How CDNs reduce latency and origin load. Points of presence, cache-control headers, origin shield, TTL strategy, cache invalidation, and dynamic vs static content delivery.",
  keywords: ["cdn", "content delivery network", "edge caching", "cache control headers", "origin shield", "cloudflare cloudfront"],
};

export default function CdnPage() {
  const topic = getTopic("system-design", "cdn");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f0883e" />;
}
