import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/testing";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Testing Backend Systems",
  description:
    "Learn backend testing strategies: unit tests, integration tests, contract tests, mocking, test databases, end-to-end testing, and writing tests that catch real bugs.",
  keywords: ["backend testing", "unit tests", "integration tests", "mocking", "test strategy", "pytest"],
};

export default function TestingPage() {
  const topic = getTopic("backend", "testing");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#a371f7"
    />
  );
}
