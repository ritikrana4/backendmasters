import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/regular-expressions";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Regular Expressions — Python",
  description:
    "Master Python regular expressions with re: search, findall, sub, capture groups, named groups, and compiled patterns. With interactive exercises.",
  keywords: ["python regex", "python regular expressions", "python re module", "re.search python", "python pattern matching"],
};

export default function RegularExpressionsPage() {
  const topic = getTopic("python", "regular-expressions");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
