import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/concurrency";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Concurrency & Parallelism — Python",
  description:
    "Understand Python's GIL, threading for I/O-bound tasks, multiprocessing for CPU-bound work, and concurrent.futures for both.",
  keywords: ["python concurrency", "python threading", "python multiprocessing", "GIL python", "concurrent.futures"],
};

export default function ConcurrencyPage() {
  const topic = getTopic("python", "concurrency");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
