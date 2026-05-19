import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/http/http-fundamentals";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "HTTP Fundamentals",
  description:
    "Learn HTTP request and response structure, all HTTP methods (GET, POST, PUT, DELETE, PATCH), status codes, and the differences between HTTP/1.1, HTTP/2, and HTTP/3.",
  keywords: ["http methods", "http status codes", "http request response", "http/2", "http fundamentals"],
};

export default function HttpFundamentalsPage() {
  const topic = getTopic("http", "http-fundamentals");
  if (!topic) notFound();

  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#58a6ff"
    />
  );
}
