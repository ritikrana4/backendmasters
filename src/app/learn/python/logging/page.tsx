import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/logging";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Logging — Python",
  description:
    "Replace print() with Python's logging module. Learn log levels, handlers, formatters, named loggers, and structured JSON logging for production.",
  keywords: ["python logging", "python logger", "python log levels", "python basicConfig", "production python"],
};

export default function LoggingPage() {
  const topic = getTopic("python", "logging");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
