import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/walrus-operator";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Walrus Operator — Python",
  description:
    "Master Python's := assignment expression: use it in while loops, if statements, and comprehensions to assign and test a value in one step.",
  keywords: ["python walrus operator", "python :=", "assignment expression python", "python 3.8 features", "python walrus"],
};

export default function WalrusOperatorPage() {
  const topic = getTopic("python", "walrus-operator");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
