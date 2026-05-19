import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/http/headers-and-body";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Headers & Body",
  description:
    "Learn how HTTP headers and request/response bodies work. Covers Content-Type, Authorization, Accept, caching headers, and the four common body formats: JSON, form data, multipart, and plain text.",
  keywords: ["http headers", "content-type", "request body", "http json", "authorization header"],
};

export default function HeadersAndBodyPage() {
  const topic = getTopic("http", "headers-and-body");
  if (!topic) notFound();

  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#58a6ff"
    />
  );
}
