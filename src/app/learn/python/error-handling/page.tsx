import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/error-handling";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Error Handling — Python",
  description:
    "Handle Python exceptions gracefully with try, except, else, finally, raise, and custom exception classes. Write resilient programs.",
  keywords: ["python error handling", "python exceptions", "try except python", "raise exception python", "python tutorial"],
};

export default function ErrorHandlingPage() {
  const topic = getTopic("python", "error-handling");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
