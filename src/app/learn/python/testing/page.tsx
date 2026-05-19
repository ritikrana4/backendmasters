import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/testing";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Testing with unittest & pytest — Python",
  description:
    "Write reliable Python with unit tests using unittest and pytest. Covers assertions, setUp, fixtures, parametrize, and test-driven development.",
  keywords: ["python testing", "python unittest", "pytest tutorial", "python TDD", "python test cases"],
};

export default function TestingPage() {
  const topic = getTopic("python", "testing");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
