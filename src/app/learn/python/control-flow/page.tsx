import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/control-flow";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Control Flow — Python",
  description:
    "Master Python control flow: if/elif/else statements, for and while loops, and break/continue. Run examples directly in the browser.",
  keywords: [
    "python control flow",
    "python if else",
    "python loops",
    "python for loop",
    "python while loop",
  ],
};

export default function ControlFlowPage() {
  const topic = getTopic("python", "control-flow");
  if (!topic) notFound();

  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
