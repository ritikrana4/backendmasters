import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/input-output";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Input & Output",
  description:
    "Learn Python input and output: reading user input with input(), converting strings to numbers, formatting output with print() and f-strings, and building interactive programs.",
  keywords: ["python input function", "python print", "python f-string", "python user input", "python input output"],
};

export default function InputOutputPage() {
  const topic = getTopic("python", "input-output");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
