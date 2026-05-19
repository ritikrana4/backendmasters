import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/api-documentation";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "API Documentation",
  description:
    "Learn API documentation best practices: OpenAPI/Swagger specification, generating docs from code, versioning docs, writing good descriptions, and tools like Redoc and Stoplight.",
  keywords: ["API documentation", "OpenAPI", "Swagger", "API spec", "Redoc", "API versioning"],
};

export default function ApiDocumentationPage() {
  const topic = getTopic("backend", "api-documentation");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#a371f7"
    />
  );
}
