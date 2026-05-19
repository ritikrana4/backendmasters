import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/http/rest-api-design";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "REST API Design",
  description:
    "Learn best practices for designing REST APIs: resource naming, HTTP method conventions, versioning strategies, pagination patterns, and consistent error response formats.",
  keywords: ["rest api design", "api best practices", "api versioning", "api pagination", "api error handling"],
};

export default function RestApiDesignPage() {
  const topic = getTopic("http", "rest-api-design");
  if (!topic) notFound();

  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#58a6ff"
    />
  );
}
