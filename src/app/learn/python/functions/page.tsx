import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/functions";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Functions — Python",
  description:
    "Learn to write Python functions with def, parameters, return values, default arguments, *args, **kwargs, and lambda expressions.",
  keywords: ["python functions", "def keyword", "python return", "lambda python", "python tutorial"],
};

export default function FunctionsPage() {
  const topic = getTopic("python", "functions");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
