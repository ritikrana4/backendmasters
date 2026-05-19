import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/strings";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Strings — Python",
  description:
    "Master Python strings: f-strings, string methods (split, join, replace, strip), slicing, formatting, and multiline strings.",
  keywords: ["python strings", "f-strings python", "string methods python", "python string formatting", "python tutorial"],
};

export default function StringsPage() {
  const topic = getTopic("python", "strings");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
