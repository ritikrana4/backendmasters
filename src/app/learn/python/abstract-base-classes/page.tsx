import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/abstract-base-classes";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Abstract Base Classes — Python",
  description:
    "Define Python interfaces with abc.ABC and @abstractmethod. Covers abstract properties, collections.abc, and typing.Protocol for structural subtyping.",
  keywords: ["python ABC", "python abstract class", "python interface", "python abstractmethod", "collections.abc"],
};

export default function AbstractBaseClassesPage() {
  const topic = getTopic("python", "abstract-base-classes");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
