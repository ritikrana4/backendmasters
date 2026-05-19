import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/http/how-the-web-works";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "How the Web Works",
  description:
    "Understand what happens when you type a URL — DNS resolution, TCP connections, HTTP requests, and the full journey from browser to server and back.",
  keywords: ["how the web works", "dns explained", "tcp ip", "http request", "web fundamentals"],
};

export default function HowTheWebWorksPage() {
  const topic = getTopic("http", "how-the-web-works");
  if (!topic) notFound();

  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#58a6ff"
    />
  );
}
