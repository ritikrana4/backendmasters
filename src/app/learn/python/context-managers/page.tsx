import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/context-managers";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Context Managers — Python",
  description:
    "Manage resources safely with Python context managers: the with statement, __enter__/__exit__, @contextmanager, contextlib.suppress, and tempfile.",
  keywords: ["python context manager", "python with statement", "python contextlib", "python __enter__ __exit__", "python tutorial"],
};

export default function ContextManagersPage() {
  const topic = getTopic("python", "context-managers");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
