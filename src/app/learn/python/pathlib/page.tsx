import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/pathlib";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "pathlib — Python",
  description:
    "Navigate and manipulate file paths with Python's pathlib.Path. Read, write, glob, mkdir, rename — all with an elegant object-oriented API.",
  keywords: ["python pathlib", "python Path", "python file paths", "pathlib vs os.path", "python filesystem"],
};

export default function PathlibPage() {
  const topic = getTopic("python", "pathlib");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
