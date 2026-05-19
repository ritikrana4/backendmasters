import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/about-python";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "About Python",
  description:
    "Discover what Python is, why it became the world's most popular programming language, and what it's used for — from web backends to AI, data science, and automation.",
  keywords: ["what is python", "python programming language", "python uses", "python overview", "learn python"],
};

export default function AboutPythonPage() {
  const topic = getTopic("python", "about-python");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
