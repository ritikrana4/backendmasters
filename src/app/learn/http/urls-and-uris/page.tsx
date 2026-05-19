import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/http/urls-and-uris";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "URLs & URIs",
  description:
    "Understand the anatomy of URLs and URIs — scheme, host, port, path, query parameters, and fragments. Learn percent-encoding and how to design clean URL structures.",
  keywords: ["url structure", "uri vs url", "query parameters", "url encoding", "percent encoding"],
};

export default function UrlsAndUrisPage() {
  const topic = getTopic("http", "urls-and-uris");
  if (!topic) notFound();

  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#58a6ff"
    />
  );
}
