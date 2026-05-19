import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/interpreted-vs-compiled";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Interpreted vs Compiled",
  description:
    "Understand how Python runs: source code to bytecode to the CPython virtual machine. Learn the difference between interpreted and compiled languages and why it matters.",
  keywords: ["python interpreted compiled", "cpython bytecode", "python virtual machine", "how python works", "python execution"],
};

export default function InterpretedVsCompiledPage() {
  const topic = getTopic("python", "interpreted-vs-compiled");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
