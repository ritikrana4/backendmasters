import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/type-hints";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Type Hints — Python",
  description:
    "Annotate Python functions and variables with type hints: basic types, Optional, Union, generics, TypeVar, and the typing module.",
  keywords: ["python type hints", "python typing", "python annotations", "python Optional", "python mypy"],
};

export default function TypeHintsPage() {
  const topic = getTopic("python", "type-hints");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
