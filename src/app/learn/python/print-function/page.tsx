import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/print-function";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "The print() Function",
  description:
    "Master Python's print() function: outputting values, f-string formatting, sep and end parameters, printing to files, and flushing output for real-time displays.",
  keywords: ["python print function", "python f-string", "python print formatting", "python output", "print sep end"],
};

export default function PrintFunctionPage() {
  const topic = getTopic("python", "print-function");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
