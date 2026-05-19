import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/http/dns-deep-dive";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "DNS Deep Dive",
  description: "Understand DNS resolution end-to-end: A, CNAME, MX, TXT, and SRV records, TTL and caching, authoritative vs recursive resolvers, geo-routing, failover, and common production gotchas.",
  keywords: ["dns resolution", "dns records", "cname record", "dns ttl", "authoritative nameserver", "dns failover"],
};

export default function DnsDeepDivePage() {
  const topic = getTopic("http", "dns-deep-dive");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#58a6ff" />;
}
